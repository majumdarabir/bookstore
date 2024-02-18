const express = require('express')
const dotenv = require('dotenv');
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { default: mongoose } = require('mongoose');
const bcrypt = require('bcrypt');
const usrModel = require('./models/userModel');
const Book = require('./models/Book')
const jwt = require('jsonwebtoken');
const userModel = require('./models/userModel');
const Jwt_secret = "123456789123"
const app = express();

const PORT = process.env.PORT || 5000

//configer dotenv
dotenv.config()

app.use(express.json())

app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT"],
    credentials: true,

}))
app.use(cookieParser())

//routing

//implements middleware
const verifyUser = (req, res, next) => {

    const token = req.cookies.token;
    // if(token === undefined){
    //     return res.json("token missing my")
    // }
    if (!token) {
        // alert("no token")
        res.json("token missing")
    }
    else {
        jwt.verify(token, Jwt_secret, (err, payload) => {
            if (err) {
                return res.json("token not verified")
            }
            else {
                const { _id } = payload
                userModel.findById(_id).then(userData => {
                    req.user = userData
                    next()
                })
            }
        })
    }
}

app.get("/home", verifyUser, (req, res) => {
    res.json("Success")
})

app.get("/main", verifyUser, (req, res) => {
    res.json("Success")
})
app.post('/register', (req, res) => {
    const { username, email, password } = req.body
    bcrypt.hash(password, 10).then((hasedPassword) => {
        const User = new usrModel({
            username,
            email,
            password: hasedPassword
        })
        User.save().then((User) => {
            res.status(200).json({ mesasage: "user saved" })
        }).catch((error) => {
            res.status(400).json({ mesasage: "user not saved" })
        })
    }).catch((err) => {
        res.status(400)
    })

})

app.post('/login', (req, res) => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(422).json({ error: "please fill all the fields" })
    }
    usrModel.findOne({ email: email }).then((savedUser) => {
        if (savedUser) {
            bcrypt.compare(password, savedUser.password, (err, resp) => {
                if (resp) {
                    const token = jwt.sign({ _id: savedUser.id }, Jwt_secret)
                    const { _id, username, email, password } = savedUser
                    res.cookie('token', token)
                    // res.status(200).json({ token, usrModel: { _id, username, email, password } })
                    console.log({ token, usrModel: { _id, username, email, password } })
                    res.json("logged")

                }
                else {
                    res.status(400).json("password is incorrect")
                }
            })
        }
        else {
            res.status(400).json({ error: "user does not exist" })
        }
    })
})

//add book 

app.post('/addbook', (req, res) => {
    const bookId = req.body
    const bookId_str = JSON.stringify(bookId)

    const inputString = bookId_str;
    const start = inputString.indexOf('"bookId":"') + '"bookId":"'.length;
    const end = inputString.indexOf('"', start);
    const extractedValue = inputString.substring(start, end);
    console.log(bookId)
    const addbook = new Book({
        bookId: extractedValue
    })
    addbook.save().then((addbook) => {
        res.status(200).json({ mesasage: "book added" })
        console.log("book added")
    }).catch((error) => {
        res.status(400).json(error)
        console.log("haramzada")
    })

})
//like book 
// app.put('/api/books/:id/like', async (req, res) => {
//     try {
//         const book = await Book.findById(req.params.id);

//         if (!book) {
//             return res.status(404).json({ msg: 'Book not found' });
//         }

//         book.likes += 1;
//         await book.save();

//         res.json({ likes: book.likes });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ msg: 'Server error' });
//     }
// });

app.put("/like", verifyUser, (req, res) => {
    Book.findOne({ bookId: req.body.bookId }).then((resp) => {
        if (resp) {
            Book.findByIdAndUpdate(resp._id.toString(), {
                $push: { likes: req.user._id }
            }, { new: true }).then((result) => {
                res.json(result)
            })
            // res.json(resp._id)
            // console.log(resp._id.toString())
        }
    })
})

//counting likes 
app.put('/getlikes', (req, res) => {
    Book.findOne({ bookId: req.body.bookId }).then((resp) => {
        res.json(resp)
    }).catch((err) => {
        res.json(err)
    })
})

//connect with mongodb 
mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log("database connected");
}).catch((err) => {
    console.log("${err}");
})

app.listen(PORT, () => {
    console.log("server started")
})