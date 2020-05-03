const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const db = admin.firestore()

exports.createUser = functions.auth.user().onCreate((user) => {
    const { uid } = user;

    const userCollection = db.collection('users');

    userCollection.doc(uid).set({
        name: "Anonymous",
        grade: 0,
        graders: 0,
        products: [],
        favorites: [],
    });
});

exports.addImage = functions.storage.object().onFinalize(async (object) => {
    const filepath = object.name.split("/");
    const folder = filepath[0];
    console.log(filepath);
    if (folder === "products" && filepath[2].length) {
        const productid = filepath[1].trim();
        const productCollection = db.collection('products');
        productCollection.doc(productid).update({
            pictures: admin.firestore.FieldValue.arrayUnion(object.name)
        });
    }
});

exports.removeImageWhenDeletingProduct = functions.firestore
    .document('products/{productID}')
    .onDelete((snap, context) => {
        const productID = context.params.productID;

        const bucket = admin.storage().bucket();

        return bucket.deleteFiles({
            prefix: `products/${productID}/`
        }, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log(`All the Firebase Storage files in users/${productID}/ have been deleted`);
            }
        });
    });