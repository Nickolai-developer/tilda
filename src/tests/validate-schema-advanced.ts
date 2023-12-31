import { Int, String_, nullableDefaults } from "../constants.js";
import EitherType from "../entities/either.js";
import Schema from "../entities/schema.js";
import { SchemaValidationResult } from "../interfaces.js";
import { ReprDefinitions, typeRepr } from "../validation/repr.js";
import validateSchema from "../validation/validate-schema.js";
import { Clock, UnitTest } from "./common.js";

const unitTest: UnitTest = {
    name: "validate-schema-advanced",
    errors: new Map(),
    test() {
        const clock = new Clock(this.errors);
        const s04 = new Schema({
            name: "S04",
            definitions: [
                {
                    name: "a",
                    definition: {
                        type: Int,
                        nullableOptions: nullableDefaults,
                    },
                },
                {
                    name: "b",
                    definition: {
                        type: String_,
                        nullableOptions: nullableDefaults,
                    },
                },
            ],
        });
        const s14 = new Schema({
            name: "S14",
            definitions: [
                {
                    name: "b",
                    definition: {
                        type: Int,
                        nullableOptions: nullableDefaults,
                    },
                },
                {
                    name: "a",
                    definition: {
                        type: String_,
                        nullableOptions: nullableDefaults,
                    },
                },
            ],
        });
        const s4 = new Schema({
            name: "S4",
            definitions: [
                {
                    name: "prop1",
                    definition: {
                        type: new EitherType({
                            types: [Int, String_, s04, s14],
                        }),
                        nullableOptions: nullableDefaults,
                    },
                },
            ],
        });
        clock.assertEqual(validateSchema({ prop1: 0 }, s4, {}), {
            errors: null,
        } as SchemaValidationResult);
        clock.assertEqual(validateSchema({ prop1: "0" }, s4, {}), {
            errors: null,
        } as SchemaValidationResult);
        clock.assertEqual(validateSchema({ prop1: true }, s4, {}), {
            errors: [
                {
                    name: "prop1",
                    expected: typeRepr(s4.definitions[0].definition, {}),
                    found: "boolean",
                },
            ],
        } as SchemaValidationResult);
        clock.assertEqual(validateSchema({ prop1: {} }, s4, {}), {
            errors: [
                {
                    name: "prop1",
                    expected: typeRepr(s4.definitions[0].definition, {}),
                    found: ReprDefinitions.OBJECT,
                    subproperties: [
                        {
                            name: "a",
                            expected: typeRepr(
                                {
                                    type: Int,
                                    nullableOptions: nullableDefaults,
                                },
                                {},
                            ),
                            found: ReprDefinitions.UNDEFINED,
                        },
                        {
                            name: "b",
                            expected: typeRepr(
                                {
                                    type: String_,
                                    nullableOptions: nullableDefaults,
                                },
                                {},
                            ),
                            found: ReprDefinitions.UNDEFINED,
                        },
                    ],
                },
            ],
        } as SchemaValidationResult);
        clock.assertEqual(validateSchema({ prop1: { a: 0 } }, s4, {}), {
            errors: [
                {
                    name: "prop1",
                    expected: typeRepr(s4.definitions[0].definition, {}),
                    found: ReprDefinitions.OBJECT,
                    subproperties: [
                        {
                            name: "b",
                            expected: typeRepr(
                                {
                                    type: String_,
                                    nullableOptions: nullableDefaults,
                                },
                                {},
                            ),
                            found: ReprDefinitions.UNDEFINED,
                        },
                    ],
                },
            ],
        } as SchemaValidationResult);
        clock.assertEqual(validateSchema({ prop1: { a: "0" } }, s4, {}), {
            errors: [
                {
                    name: "prop1",
                    expected: typeRepr(s4.definitions[0].definition, {}),
                    found: ReprDefinitions.OBJECT,
                    subproperties: [
                        {
                            name: "b",
                            expected: typeRepr(
                                {
                                    type: Int,
                                    nullableOptions: nullableDefaults,
                                },
                                {},
                            ),
                            found: ReprDefinitions.UNDEFINED,
                        },
                    ],
                },
            ],
        } as SchemaValidationResult);
    },
};

export default unitTest;
