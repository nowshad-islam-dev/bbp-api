import { seed } from 'drizzle-seed';
import { db } from '../src/db';
import * as schema from '../src/db/schema';

async function main() {
    // user table
    await seed(db, { users: schema.users }).refine((f) => ({
        users: {
            count: 10,
            columns: {
                firstName: f.firstName(),
                lastName: f.lastName(),
                email: f.email(),
                phone: f.phoneNumber({
                    prefixes: ['01'],
                    generatedDigitsNumbers: 9,
                }),
                role: f.valuesFromArray({ values: ['user'] }),
            },
        },
    }));

    // Optional TODO: fails because of foreign key being present on table
    // comments table
    // await seed(db, { comments: schema.comments }).refine((f) => ({
    //     comments: {
    //         count: 5,
    //         columns: {
    //             newsId: f.valuesFromArray({ values: [1, 2, 3, 4, 5] }),
    //             userId: f.valuesFromArray({ values: [1, 2, 3, 4, 5] }),
    //         },
    //     },
    // }));

    // newsToTags table
    // await seed(db, { newsToTags: schema.newsToTags }).refine((f) => ({
    //     newsToTags: {
    //         count: 5,
    //         columns: {
    //             newsId: f.valuesFromArray({ values: [1, 2, 3, 4, 5] }),
    //             tagId: f.valuesFromArray({ values: [1, 2, 3] }),
    //         },
    //     },
    // }));

    // news table
    await seed(db, { news: schema.news }).refine((f) => ({
        news: {
            count: 5,
            columns: {
                text: f.loremIpsum({ sentencesCount: 1 }),
                img: f.valuesFromArray({
                    values: [
                        'https://link.com/1.jpg',
                        'https://link.com/2.jpg',
                    ],
                }),
            },
        },
    }));

    // events table
    await seed(db, { events: schema.events }).refine((f) => ({
        events: {
            count: 5,
            columns: {
                text: f.loremIpsum({ sentencesCount: 1 }),
            },
        },
    }));

    // candidates table
    await seed(db, { candidates: schema.candidates }).refine((f) => ({
        candidates: {
            count: 5, // Define count here inside refine
            columns: {
                name: f.fullName(),
                img: f.valuesFromArray({
                    values: [
                        'https://link.com/1.jpg',
                        'https://link.com/2.jpg',
                    ],
                }),
                gender: f.valuesFromArray({ values: ['male', 'female'] }),
                age: f.int({ minValue: 25, maxValue: 80 }),
                type: f.valuesFromArray({
                    values: [
                        'possible',
                        'eligible',
                        'withdrawn',
                        'elected',
                        'nonelected',
                    ],
                }),
                politicalParty: f.valuesFromArray({
                    values: ['bnp', 'jamat', 'ncp'],
                }),
                vicinity: f.city(),
                district: f.state(),
                division: f.state(),
            },
        },
    }));

    // tags table
    await seed(db, { tags: schema.tags }).refine((f) => ({
        tags: {
            count: 3,
            columns: {
                name: f.valuesFromArray({
                    values: ['all', 'politics', 'election'],
                }),
            },
        },
    }));
}

main()
    .then(() => console.log('DB seeded for development'))
    .catch((err) => {
        console.error('Error seeding DB for development');
        console.log(err);
    })
    .finally(() => process.exit(1));
