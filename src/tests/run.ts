import { UnitTest, runUnitTests } from "./common.js";
import repr from "./repr.js";
import typeRepr from "./type-repr.js";
import nullable from "./validate-nullable.js";
import scalar from "./validate-scalar.js";
import schema from "./validate-schema-common.js";

const tests: UnitTest[] = [repr, typeRepr, nullable, scalar, schema];

runUnitTests(tests);

const errors = tests
    .map(({ name, errors }) =>
        [...errors].map<[string, number, Error]>(([index, error]) => [
            name,
            index,
            error,
        ]),
    )
    .flat();

for (const [name, index, error] of errors) {
    console.error(
        `Unit \`${name}\` error at assertion with index ${index}:`,
        error.message,
    );
    console.error(error.cause);
    console.log("------------------------------------------------------------");
}

console.log("fin");
