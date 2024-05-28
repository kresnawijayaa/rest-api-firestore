const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

// Inisialisasi aplikasi Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});

app.get('/items', async (req, res) => {
    try {
      const snapshot = await db.collection('items').get();
      const items = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() });
      });
      res.status(200).send(items);
    } catch (error) {
      res.status(500).send(error.message);
    }
});

app.post('/items', async (req, res) => {
    try {
      const data = req.body;
      const ref = await db.collection('items').add(data);
      res.status(201).send({ id: ref.id });
    } catch (error) {
      res.status(500).send(error.message);
    }
});

app.get('/items/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const doc = await db.collection('items').doc(id).get();
      if (!doc.exists) {
        return res.status(404).send('Item not found');
      }
      res.status(200).send({ id: doc.id, ...doc.data() });
    } catch (error) {
      res.status(500).send(error.message);
    }
});

app.put('/items/:id', async (req, res) => {
    try {
      const id = req.params.id;
      const data = req.body;
      await db.collection('items').doc(id).set(data, { merge: true });
      res.status(200).send('Item updated');
    } catch (error) {
      res.status(500).send(error.message);
    }
});

app.delete('/items/:id', async (req, res) => {
    try {
      const id = req.params.id;
      await db.collection('items').doc(id).delete();
      res.status(200).send('Item deleted');
    } catch (error) {
      res.status(500).send(error.message);
    }
});
  