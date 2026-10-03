import { extractTriples } from "./extract.js";

const sampleText = `
Project Alpha was created using Python and MongoDB. It was later deployed on AWS.
After a few months, the team migrated Alpha from MongoDB to PostgreSQL because
relational queries were becoming difficult to manage. Redis was also added for caching,
and the team introduced a microservices architecture.
`;

const result = await extractTriples(sampleText);
console.log(JSON.stringify(result.triples, null, 2));
console.log("Token usage:", result.usage);