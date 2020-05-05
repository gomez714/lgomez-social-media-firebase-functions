
const { db } = require('../utility/admin');
 
exports.getAllCrafts =  (request, response) => {
    db
    .collection('crafts')
    .orderBy('createdAt', 'desc')
    .get()
        .then(data => {
            let crafts = [];
            data.forEach(doc => {
                crafts.push({
                    craftId: doc.id,
                    body: doc.data().body,
                    userHandle: doc.data().userHandle,
                    createdAt: doc.data().createdAt,
                    userImage: doc.data().userImage,
                    commentCount: doc.data().commentCount,
                    likeCount: doc.data().likeCount
                });
            })

            return response.json(crafts);
        })
        .catch( error =>{
            console.log("Craft error:", error);
        })
};

exports.postOneCraft = (request, response) => {

    if (request.body.body.trim() === '') {
        return response.status(400).json({ body: 'Body must not be empty' });
    }
    
    const newCraft = {
        body: request.body.body,
        userHandle: request.user.handle,
        userImage: request.user.imageUrl,
        createdAt: new Date().toISOString(),
        likeCount: 0,
        commentCount: 0
    };

    db
        .collection('crafts')
        .add(newCraft)
            .then(doc => {
                const responseCraft = newCraft;
                responseCraft.craftId = doc.id;
                response.json(responseCraft);
            })
            .catch( error => {
                response.status(500).json({ error: 'Something went wrong'});
                console.error(error);
            })
    
};

exports.getCraft = (request, response) => {
    let craftData = {};
    db.doc(`/crafts/${request.params.craftId}`)
    .get()
    .then( doc => {
        if(!doc.exists){
            return response.status(400),json({ error: "Craft not found"});
        }
        craftData = doc.data();
        craftData.craftId = doc.id;
        return db.collection('comments').orderBy('createdAt', 'desc').where('craftId', '==', request.params.craftId).get();
    })
    .then(data => {
        craftData.comments = [];
        data.forEach(doc => {
            craftData.comments.push(doc.data());
        });

        return response.json(craftData);
    })
    .catch(error => {
        console.error(error);
        return response.status(500).json({ error: error.code});
    })
}

exports.commentOnCraft = (request, response) => {
    if(request.body.body.trim() == "") return response.status(400).json({ comment: "Must not be empty"});
    const newComment = {
        body: request.body.body,
        createdAt: new Date().toISOString(),
        craftId: request.params.craftId,
        userHandle: request.user.handle,
        userImage: request.user.imageUrl
    };

    db.doc(`/crafts/${request.params.craftId}`)
        .get()
        .then(doc => {
            if(!doc.exists){
                return response.status(400).json({ error: 'Craft not found'});
            } 
            return doc.ref.update({ commentCount: doc.data().commentCount + 1});
        })
        .then(() => {
            return db.collection('comments').add(newComment);
        })
        .then(() => {
            return response.json(newComment);
        })
        .catch(error => {
            console.error(error);
            return response.status(500).json({error: 'Something went wrong'});
        })
}

exports.likeCraft = (request, response) => {
    const likeDocument = db.collection('likes').where("userHandle", "==", request.user.handle)
        .where('craftId', '==', request.params.craftId).limit(1);
    
    const craftDocument = db.doc(`/crafts/${request.params.craftId}`);

    let craftData = {};

    craftDocument.get()
        .then(doc => {
            if(doc.exists){
                craftData = doc.data();
                craftData.craftId = doc.id;
                return likeDocument.get();
            } else {
                return response.status(400).json({error: "Craft not found"});
            }
        })
        .then( data => {
            if(data.empty){
                return db.collection('likes').add({
                    craftId: request.params.craftId,
                    userHandle: request.user.handle
                })
                .then(() => {
                    craftData.likeCount++;
                    return craftDocument.update({ likeCount: craftData.likeCount});
                })
                .then(() => {
                    return response.json(craftData);
                });
            } else {
                return response.status(400).json({ error: "Craft already liked"});
            }
        })
        .catch( error => {
            console.error(error);
            return response.status(500).json({error: error.code});
        })
}

exports.unlikeCraft = (request, response) => {
    const likeDocument = db.collection('likes').where("userHandle", "==", request.user.handle)
        .where('craftId', '==', request.params.craftId).limit(1);
    
    const craftDocument = db.doc(`/crafts/${request.params.craftId}`);

    let craftData = {};

    craftDocument.get()
        .then(doc => {
            if(doc.exists){
                craftData = doc.data();
                craftData.craftId = doc.id;
                return likeDocument.get();
            } else {
                return response.status(400).json({error: "Craft not found"});
            }
        })
        .then( data => {
            if(data.empty){
                return response.status(400).json({ error: "Craft not liked"});
            } else {
                return db.doc(`/likes/${data.docs[0].id}`).delete()
                    .then(() => {
                        craftData.likeCount--;
                        return craftDocument.update({ likeCount: craftData.likeCount});
                    })
                    .then(() => {
                        return response.json(craftData);
                    });
            }
        })
        .catch( error => {
            console.error(error);
            return response.status(500).json({error: error.code});
        });
}

exports.deleteCraft = (request, response) => {
    const document = db.doc(`/crafts/${request.params.craftId}`);
    document.get()
    .then(doc => {
        if(!doc.exists){
            return response.status(404).json({error: "Craft not found"});
        }
        if(doc.data().userHandle !== request.user.handle){
            return response.status(403).json({ error: "Unauthorized"});
        } else {
            return document.delete();
        }
    })
    .then(() => {
        return response.json({message: 'Craft successfully deleted'});
    })
    .catch(error => {
        console.error(error);
        return response.status(500).json({error: error.code});
    })
}