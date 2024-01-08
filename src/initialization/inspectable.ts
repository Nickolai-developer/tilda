import { useOptions, usedReprOpts } from "../config.js";
import { TildaRuntimeError } from "../errors.js";
import type { ReprOptions, SchemaValidationResult } from "../index.js";
import { validateSchema } from "../validation/validate-schema.js";
import { Store } from "./store.js";

export abstract class Inspectable {
    public static inspect<T extends Inspectable>(
        obj: T,
        options?: ReprOptions,
    ): SchemaValidationResult {
        const schema = Store.get(this);
        if (!schema) {
            throw new TildaRuntimeError(
                `No schema defined for \`${this.name}\``,
            );
        }
        if (!schema.fullyDefined) {
            throw new TildaRuntimeError(
                `Schema \`${this.name}\` is a template schema.`,
            );
        }
        const holdOptions = usedReprOpts;
        options && useOptions(options);
        const result = validateSchema(obj, schema);
        useOptions(holdOptions);
        return result;
    }
}
