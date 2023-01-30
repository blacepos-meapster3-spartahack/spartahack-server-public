const { ObjectId } = require("mongodb");

async function dbSelectNotes (mgdatabase, UserId) {
    // use cases:
    //  - select all of the Note summaries and Sentiments of a particular UserId

    const text = "SELECT * FROM \"Notes\" WHERE \"UserId\" = $1"
    const values = [UserId]
    
    // async/await
    try {

        const collection = mgdatabase.collection("Notes");
        const res = await collection.find({ UserId: UserId }).toArray();

        console.log(res.rows)
        // { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
        return res;

    } catch (err) {
        console.log(err.stack)
    }

    return null;
}

async function dbInsertNotes (mgdatabase, UserId, Note, Sentiment = null) {
    // use cases:
    //  - insert Note summary, Sentiment, and the corresponding UserId
    //  - insert Note summary with the corresponding UserId without a sentiment (default it to 0)

    if (Sentiment === null) {
        Sentiment = 0;
    }

    const text = "INSERT INTO \"Notes\"(\"UserId\", \"Note\", \"Sentiment\") \
                    VALUES ($1, $2, $3);";
    const values = [UserId, Note, Sentiment]
    // async/await
    try {
        const collection = mgdatabase.collection("Notes");
        await collection.insertOne({ UserId: UserId, Note: Note, Sentiment: Sentiment });

        // { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
        return;

    } catch (err) {
        console.log(err.stack)
    }

    return null;
}

async function dbUpdateNote (mgdatabase, UserId, Note, Sentiment = null) {
    // take from the nearest note that says "processing..."

    if (Sentiment === null) {
        Sentiment = 0;
    }

    try {
        const collection = mgdatabase.collection("Notes");
        await collection.updateOne( {UserId: UserId, Note: "Processing...", Sentiment: 0 }, {$set:{Note: Note, Sentiment: Sentiment}});

        return;
    } catch (err) {
        console.log(err.stack)
    }

    return null;
}

async function dbDeleteNote (mgdatabase, NoteId) {
    // use cases:
    //  - insert Note summary, Sentiment, and the corresponding UserId
    //  - insert Note summary with the corresponding UserId without a sentiment (default it to 0)

    // async/await
    try {
        const collection = mgdatabase.collection("Notes");
        console.log(ObjectId(NoteId));
        console.log(new ObjectId(NoteId));
        obj = new ObjectId(NoteId)
        await collection.deleteOne({ _id: obj });

        // { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
        return;

    } catch (err) {
        console.log(err.stack)
    }

    return null;
}

module.exports = { dbDeleteNote, dbUpdateNote, dbSelectNotes, dbInsertNotes };