import { nullableDefaults } from "../constants.js";
import {
    CompleteDefinition,
    NullableOptions,
    ReprOptions,
    ExactTypeEntity,
    TypeRepresentation,
} from "../interfaces.js";

export enum ReprDefinitions {
    DELIM_OR = " | ",
    DELIM_COLON = ", ",
    NO_PROPERTY = "<no-property>",
    UNDEFINED = "undefined",
    NULL = "null",
    NAN = "<NaN>",
    OBJECT = "<object>",
}

export function repr(
    valOrObj: any,
    propOrOptions: string | ReprOptions,
    opts?: ReprOptions,
): TypeRepresentation {
    let val, obj, property: string, options: ReprOptions;
    if (typeof propOrOptions === "string") {
        property = propOrOptions;
        obj = valOrObj;
        options = opts || {};
        return obj.hasOwnProperty(property)
            ? repr(obj[property], options)
            : options.hasPropertyCheck
            ? ReprDefinitions.NO_PROPERTY
            : ReprDefinitions.UNDEFINED;
    } else {
        val = valOrObj;
        options = propOrOptions;
        if (
            options.useValue &&
            ["bigint", "number", "string", "boolean"].includes(typeof val)
        ) {
            const isstr = typeof val === "string";
            return (isstr ? '"' : "") + val + (isstr ? '"' : "");
        }
        switch (typeof val) {
            case "object":
                return val ? ReprDefinitions.OBJECT : ReprDefinitions.NULL;
            case "undefined":
                return ReprDefinitions.UNDEFINED;
            case "bigint":
            case "boolean":
            case "number":
            case "string":
                return typeof val;
            default:
                throw new Error(`Repr error: ${typeof val} isn't allowed.`);
        }
    }
}

const joinTypeParts = (
    ...args: (string | false | null | undefined)[]
): string => args.filter(s => s).join(ReprDefinitions.DELIM_OR);

const encase = (type: string): string =>
    type.startsWith("(") && type.endsWith(")") ? type : `(${type})`;

const uniqueTypes = (types: ExactTypeEntity[]): ExactTypeEntity[] => {
    const extendedTypes = types.map(type =>
        type.entity === "EITHER" && !type.name ? uniqueTypes(type.types) : type,
    );
    const unique = extendedTypes.flat().reduce((arr, current) => {
        if (arr.findIndex(t => t === current) === -1) {
            arr.push(current);
        }
        return arr;
    }, [] as ExactTypeEntity[]);
    return unique;
};

export function nullableRepr(
    { nullable, defined, optional }: NullableOptions,
    options: ReprOptions,
): TypeRepresentation {
    return joinTypeParts(
        nullable && ReprDefinitions.NULL,
        !defined && ReprDefinitions.UNDEFINED,
        options.hasPropertyCheck && optional && ReprDefinitions.NO_PROPERTY,
    );
}

export function typeRepr(
    { type, nullableOptions }: CompleteDefinition,
    options: ReprOptions,
): TypeRepresentation {
    const nullableStr = nullableRepr(nullableOptions, options);
    if (type.entity === "EITHER") {
        if (type.name) {
            return nullableStr
                ? encase(joinTypeParts(type.name, nullableStr))
                : type.name;
        }
        const typeRs = uniqueTypes(type.types).map(t =>
            typeRepr({ type: t, nullableOptions: nullableDefaults }, options),
        );
        nullableStr && typeRs.push(nullableStr);
        const typeR = typeRs.join(ReprDefinitions.DELIM_OR);
        return typeRs.length > 1 ? encase(typeR) : typeR;
    }
    if (type.entity === "STATIC") {
        return joinTypeParts(
            type.name ||
                `[${type.types
                    .map(t => typeRepr(t, options))
                    .join(ReprDefinitions.DELIM_COLON)}]`,
            nullableStr,
        );
    }
    if (type.entity === "SCALAR" || type.entity === "SCHEMA") {
        return joinTypeParts(type.name, nullableStr);
    }
    if (type.entity === "ARRAY") {
        const elem = typeRepr(type.elemDefinition, options);
        return (
            [
                `${
                    elem.includes(ReprDefinitions.DELIM_OR)
                        ? encase(elem)
                        : elem
                }[]`,
                nullableStr,
            ].filter(s => s) as string[]
        ).join(ReprDefinitions.DELIM_OR);
    }
    throw new Error("Not implemened~");
}