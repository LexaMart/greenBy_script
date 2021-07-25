const admin = require("firebase-admin");

const key = require('./fire-keys.json');
admin.initializeApp({
  credential: admin.credential.cert(key),
});
const db = admin.firestore();

(async function (db) {
  try {
    const routeDotsSet = new Set()
    const routesRefs = await db.collection('routes').get();
    const routes = await Promise.all(
      routesRefs.docs.map(async (routeRef) => {
        const dotsRef = (await routeRef.get('dots'))
        if (dotsRef) {
          await Promise.all(
            dotsRef.map(async (dotRef) => {
              routeDotsSet.add(dotRef.id)
            })
          )
        }
      })
    )
    const dotsRefs = await db.collection('dots').get();
    const dots = await Promise.all(
      dotsRefs.docs.map(async (dotRef) => {
        if (!routeDotsSet.has(dotRef.id)) {
          await db.collection('dots').doc(dotRef.id).delete()
        }
      })
    )
  } catch (e) {
    console.log(e);
  }
})(db)
