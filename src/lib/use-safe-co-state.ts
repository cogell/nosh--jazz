import * as React from 'react';
import {
  z,
  type CoValueOrZodSchema,
  type ResolveQuery,
  type ResolveQueryStrict,
  type Loaded,
} from 'jazz-tools';
import type { ZodTypeAny, AnyZodObject } from 'zod';
import { useCoState } from 'jazz-tools/react';

/* -------------------------------------------------- helpers ------------ */

const T = {
  // v4/v5 compatibility
  ZodObject: 'ZodObject',
  ZodArray: 'ZodArray',
  ZodOptional: 'ZodOptional',
  ZodNullable: 'ZodNullable',
  ZodUnion: 'ZodUnion',
  ZodEffects: 'ZodEffects',
  ZodDefault: 'ZodDefault',
  ZodBranded: 'ZodBranded',
  ZodPipeline: 'ZodPipeline',
  ZodLazy: 'ZodLazy',
};

/** Runtime tag helper */
function kind(s: ZodTypeAny): string {
  const def = (s as any)._def;
  /* 1️⃣  official field in full Zod builds (v4 & v5) */
  if (def?.typeName) return def.typeName;

  /* 2️⃣  Jazz’s slimmer build stores it in `t`            */
  if (def?.t) return def.t;

  /* 3️⃣  fall-back to constructor name                    */
  return (s as any).constructor?.name;
}

/** Jazz primitives expose .valueOf() / .toJSON() */
const toPlain = (v: any) =>
  v && typeof v === 'object'
    ? typeof v.valueOf === 'function'
      ? v.valueOf()
      : typeof v.toJSON === 'function'
      ? v.toJSON()
      : v
    : v;

/** Recursively unwrap decorator nodes */
function unwrap(schema: ZodTypeAny): ZodTypeAny {
  while (
    [
      T.ZodEffects,
      T.ZodDefault,
      T.ZodBranded,
      T.ZodPipeline,
      T.ZodLazy,
    ].includes(kind(schema))
  ) {
    schema =
      kind(schema) === T.ZodLazy
        ? (schema as any).schema
        : '_def' in schema && 'schema' in (schema as any)._def
        ? (schema as any)._def.schema
        : (schema as any).removeDefault?.();
  }
  return schema;
}

/** Replace invalid leaves with null, preserve structure. */
function sanitize(value: any, schema: ZodTypeAny): any {
  const base = unwrap(schema);

  /* Fast path: whole subtree valid */
  if (base.safeParse(toPlain(value)).success) return value;

  console.log('base', base);
  console.log('kind', kind(base));

  switch (kind(base)) {
    case T.ZodObject: {
      console.log('ZodObject', base);
      const out: Record<string, any> = {};
      const shape = (base as AnyZodObject).shape;
      for (const key of Object.keys(shape)) {
        out[key] = sanitize(value?.[key], shape[key]);
      }
      return out;
    }

    case T.ZodArray: {
      const el = (base as any)._def.type ?? (base as any).element;
      if (value == null || typeof (value as any).map !== 'function')
        return null;
      return (value as any[] | undefined)?.map((v) => sanitize(v, el));
    }

    case T.ZodOptional:
    case T.ZodNullable:
      return value == null ? value : sanitize(value, (base as any).unwrap());

    case T.ZodUnion: {
      const plain = toPlain(value);
      const match = (base as any)._def.options.find(
        (opt: ZodTypeAny) => opt.safeParse(plain).success,
      );
      return match ? plain : null;
    }

    default:
      return null; // primitive or unsupported wrapper
  }
}

/* -------------------------------------------------- the hook ----------- */

export function useSafeCoState<
  S extends CoValueOrZodSchema,
  const R extends ResolveQuery<S> = true,
>(
  Schema: S,
  id: string | undefined,
  options?: { resolve?: ResolveQueryStrict<S, R> },
): Loaded<S, R> | undefined | null {
  const raw = useCoState(Schema, id, options); // live Jazz subscription

  return React.useMemo(() => {
    if (raw == null) return raw;
    return sanitize(raw, Schema as unknown as ZodTypeAny);
  }, [raw, Schema]);
}
