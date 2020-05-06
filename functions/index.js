const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./utility/fbauth');

const cors = require('cors');
app.use(cors());

const { db } = require('./utility/admin');

const { getAllCrafts, postOneCraft, getCraft, deleteCraft, commentOnCraft, likeCraft, unlikeCraft } = require('./handlers/crafts');
const { signUp, login, uploadImage, addUserDetails, getAuthenticatedUser, getUserDetails, markNotificationsRead } = require('./handlers/users');

// Craft routes

app.get('/crafts', getAllCrafts);
app.post('/craft' , FBAuth, postOneCraft);
app.get('/craft/:craftId', getCraft);
app.delete('/craft/:craftId', FBAuth, deleteCraft);
app.post('/craft/:craftId/comment' , FBAuth, commentOnCraft);
app.get('/craft/:craftId/like' , FBAuth, likeCraft);
app.get('/craft/:craftId/unlike' , FBAuth, unlikeCraft);


// User routes

app.post('/signup', signUp);
app.post('/login', login);
app.post('/user/image', FBAuth, uploadImage);
app.post('/user', FBAuth, addUserDetails);
app.get('/user', FBAuth, getAuthenticatedUser);
app.get('/user/:handle', getUserDetails);
app.post('/notifications', FBAuth, markNotificationsRead);


exports.api = functions.region('us-central1').https.onRequest(app);

exports.createNotificationOnLike = functions.region('us-central1').firestore.document('likes/{id}')
    .onCreate((snapshot) => {
        return db.doc(`/crafts/${snapshot.data().craftId}`).get()
            .then(doc => {
                if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle){
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().userHandle,
                        sender: snapshot.data().userHandle,
                        type: 'like',
                        read: false,
                        craftId: doc.id
                    });
                }
            })
            .catch(error => {
                console.error(error);
            })
    });


exports.deleteNotificationOnUnlike = functions.region('us-central1').firestore.document('likes/{id}')
    .onDelete((snapshot) => {
        return db.doc(`/notifications/${snapshot.id}`)
            .delete()
            .catch(error => {
                console.error(error);
                return;
            })
    })

exports.createNotificationOnComment = functions.region('us-central1').firestore.document('comments/{id}')
    .onCreate((snapshot) => {
        return db.doc(`/crafts/${snapshot.data().craftId}`).get()
            .then(doc => {
                if(doc.exists && doc.data().userHandle !== snapshot.data().userHandle){
                    return db.doc(`/notifications/${snapshot.id}`).set({
                        createdAt: new Date().toISOString(),
                        recipient: doc.data().userHandle,
                        sender: snapshot.data().userHandle,
                        type: 'comment',
                        read: false,
                        craftId: doc.id
                    });
                }
            })
            .catch(error => {
                console.error(error);
                return;
            })
    });

exports.onUserImageChange = functions.region('us-central1').firestore.document('/users/{userId}')
    .onUpdate((change) => {
        console.log(change.before.data());
        console.log(change.after.data());
        if(change.before.data().imageUrl !== change.after.data().imageUrl){
        const batch = db.batch();
            return db.collection('crafts').where('userHandle', '==', change.before.data().handle).get()
            .then(data => {
                data.forEach(doc => {
                    const craft = db.doc(`/crafts/${doc.id}`);
                    batch.update(craft, {userImage: change.after.data().imageUrl});
                });
                return batch.commit();
            })
        } else return true;
    })

exports.onCraftDelete = functions.region('us-central1').firestore.document('/crafts/{craftId}')
    .onDelete((snapshot, context) => {
        const craftId = context.params.craftId;
        const batch = db.batch();
        return db.collection('comments').where('craftId', '==', craftId).get()
            .then((data) => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/comments/${doc.id}`));
                });
                return db.collection('likes').where('craftId', '==', craftId).get();
            })
            .then(data => {
                data.forEach((doc) => {
                    batch.delete(db.doc(`/likes/${doc.id}`));
                });
                return db.collection('notifications').where('craftId', '==', craftId).get();
            })
            .then(data => {
                data.forEach(doc => {
                    batch.delete(db.doc(`/notifications/${doc.id}`));
                });
                return batch.commit();
            })
            .catch(error => console.error(error));

    })