const { requiresAuth } = require('express-openid-connect');
const { dbDeleteNote, dbUpdateNote, dbSelectNotes, dbInsertNotes } = require('../util/db_funcs.js');
const { getSentiment, getSummary } = require('../util/helpers.js');
var router = require('express').Router();

router.get('/', requiresAuth(), async function (req, res, next) {
  try {

    const collection = req.mgdatabase.collection("Notes");
    
    var results = await collection.find({ UserId: res.locals.user.sub }).toArray();
    console.log(results);
  } catch (err) {
    console.error("error executing query:", err);
  } finally {
    req.mgclient.close();
  }
  
  res.render('index', {
    title: 'Notes',
    results: results,
    isAuthenticated: req.oidc.isAuthenticated()
  });
});

router.get('/isauthenticated', function (req, res, next) {
  res.send({
    isAuthenticated: req.oidc.isAuthenticated(),
    user: req.oidc.user
  });
});

router.post('/delete', async function (req, res, next) {
  dbDeleteNote(req.mgdatabase, req.body.id);
});

router.post('/extension', async function (req, res, next) {

  // first just make a note that says one is in "Processing..."
  await dbInsertNotes(req.mgdatabase, res.locals.user.sub, "Processing...");
 
  //if the selected text is 300 or less, save the raw data and just do sentiment analysis.

  // get sentiment
  var sentiment = await getSentiment(req.body.text);
  var summary = req.body.text;

  if (summary.length <= 300) {
    await dbUpdateNote(req.mgdatabase, res.locals.user.sub, req.body.text, sentiment);
    return;
  }

  // get summary
  try {
    summary = await getSummary(summary);
  }
  catch (err) {
    console.error("error executing summary .exe: ", err);
  }
  console.log("Sentiment:")
  console.log(sentiment);
  console.log("Summary:")
  console.log(summary);

  // can we do the summary and the sentiment at the same time?

  if (summary.length == 0) {
    await dbUpdateNote(req.mgdatabase, res.locals.user.sub, req.body.text, sentiment);
    return;
  }

  // add, no update! to database
  await dbUpdateNote(req.mgdatabase, res.locals.user.sub, summary, sentiment);
});

module.exports = router;
