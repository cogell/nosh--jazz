import * as React from 'react';
import {
  // z,
  type CoValueOrZodSchema,
  type ResolveQuery,
  type ResolveQueryStrict,
  type Loaded,
} from 'jazz-tools';
import { z } from 'zod';
import { useCoState } from 'jazz-tools/react';

/* ---- helpers ----------------------------------------------------------- */

/** Jazz primitives expose .valueOf() and .toJSON() – use whichever exists. */
function toPlain(v: any) {
  if (v && typeof v === 'object') {
    if (typeof v.valueOf === 'function') return v.valueOf();
    if (typeof v.toJSON === 'function') return v.toJSON();
  }
  return v;
}

/** Strip Zod wrappers (effects, default, brand, pipeline, lazy) until we
 *   reach the “real” schema. */
function unwrap(schema: z.ZodTypeAny): z.ZodTypeAny {
  // eslint-disable-next-line no-constant-condition
  while (
    schema instanceof z.ZodEffects ||
    schema instanceof z.ZodDefault ||
    schema instanceof z.ZodBranded ||
    schema instanceof z.ZodPipeline ||
    schema instanceof z.ZodLazy
  ) {
    // effects / pipeline / brand keep their child schema in _def.schema
    // default keeps it in .removeDefault().schema
    // lazy stores a getter
    schema =
      schema instanceof z.ZodLazy
        ? schema.schema
        : 'schema' in (schema as any)._def
        ? (schema as any)._def.schema
        : (schema as z.ZodDefault<any>).removeDefault();
  }
  return schema;
}

function sanitize(value: any, schema: z.ZodTypeAny): any {
  const base = unwrap(schema);

  /* 1 ─ composite nodes -------------------------------------------------- */
  if (base instanceof z.ZodObject) {
    const out: Record<string, any> = {};
    const shape = (base as z.AnyZodObject).shape;
    for (const key of Object.keys(shape)) {
      out[key] = sanitize(value?.[key], shape[key]);
    }
    return out;
  }

  if (base instanceof z.ZodArray) {
    return (value as any[] | undefined)?.map((v) =>
      sanitize(v, (base.element ?? (base as any)._def.type) as z.ZodTypeAny),
    );
  }

  if (base instanceof z.ZodOptional || base instanceof z.ZodNullable) {
    return value == null ? value : sanitize(value, base.unwrap());
  }

  if (base instanceof z.ZodUnion) {
    const plain = toPlain(value);
    const variant = base.options.find(
      (opt: z.ZodTypeAny) => opt.safeParse(plain).success,
    );
    return variant ? plain : null;
  }

  /* 2 ─ leaf  ----------------------------------------------------------- */
  return base.safeParse(toPlain(value)).success ? toPlain(value) : null;
}

/* ---- the hook --------------------------------------------------------- */

export function useSafeCoState<
  S extends CoValueOrZodSchema,
  const R extends ResolveQuery<S> = true,
>(
  Schema: S,
  id: string | undefined,
  options?: { resolve?: ResolveQueryStrict<S, R> },
): Loaded<S, R> | undefined | null {
  const raw = useCoState(Schema, id, options); // native Jazz hook

  return React.useMemo(() => {
    if (raw == null) return raw; // loading / not found
    return sanitize(raw, Schema as unknown as z.ZodTypeAny);
  }, [raw, Schema]);
}
