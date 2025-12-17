# Apis_Blog

Apis_Blog/
│
├── config/
│ └── db.js
│
├── controllers/
│ ├── authController.js
│ ├── postController.js
│ └── commentController.js
│
├── middleware/
│ └── authMiddleware.js
│
├── models/
│ ├── User.js
│ ├── Post.js
│ └── Comment.js
│
├── routes/
│ ├── authRoutes.js
│ ├── postRoutes.js
│ └── commentRoutes.js
│
├── server.js
├── package.json
├── .gitignore
└── README.md


## Features

-JWT Authentication (Register / Login)
-User Roles (User)
-Create, Read, Update, Delete Blog Posts
-Like / Unlike Posts
-Add, Update, Delete Comments
-Reply to Comments
-Like / Unlike Comments
-Admin Comment Approval
-Secure APIs with Middleware


## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- Thunder Client


## Run Project
npm install
node server.js


## AUTH APIs

1. Register User
POST /api/auth/register
Request Body:
{ username: "john", email: "john@gmail.com", password: "123456" }
Response:
{ message: "User registered successfully" }


2. Login User
POST /api/auth/login
Request Body:
{ email: "john@gmail.com", password: "123456" }
Response:
{ token: "JWT_TOKEN" }


3. Create Post
POST /api/posts
Headers: Authorization: Bearer JWT_TOKEN
Request Body:
{ title: "My Post", content: "Post content", tags: ["node","mongo"] }
Response:
{ message: "Post created successfully", post: {...} }



4. Get All Posts
GET /api/posts?page=1&limit;=5
Response:
{ totalPosts: 10, posts: [...] }


5. Get Single Post
GET /api/posts/:id
Response:
{ title, content, author, views }


6. Add Comment
POST /api/comments
Headers: Authorization: Bearer JWT_TOKEN
Request Body:
{ postId: "POST_ID", content: "Nice post" }
Response:
{ message: "Comment added successfully" }



7. Get Comments
GET /api/comments?postId=POST_ID
Error Handling
400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Server Error


## Environment Variables
PORT = 5000
MONGO_URI
JWT_SECRET