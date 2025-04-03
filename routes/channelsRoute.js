const express = require('express');
const channelsController = require('../controllers/channelsController');
const { isAuthProtected, isRestricted } = require('../middlewares/protected');
const { uploadSingleTube, uploadSingleAudio, uploadSingleImage, uploadSingleBook, uploadSingleEpisode } = require('../middlewares/multer');

//////////////////////////////////////////////////
//////////////////////////////////////////////////
const router = express.Router();


//////////////////////////////////////////////////
// TUBES
//////////////////////////////////////////////////
router.get("/tubes", isAuthProtected, channelsController.getTubes);
router.get("/tubes/my-tubes", isAuthProtected, channelsController.getAllMyTubes);

// router.get("/tubes/all-tubes", isAuthProtected, isRestricted, channelsController.getAllTubes);
router.post("/tubes/upload", uploadSingleTube, isAuthProtected, channelsController.uploadTube);
router.get("/tubes/:id", isAuthProtected, channelsController.getOneTubeById);
router.get("/tubes/creator/:id", channelsController.getAllTubesForCreator);

router.patch("/tubes/:id", isAuthProtected, channelsController.updateOneTubeById);
router.delete("/tubes/:id", isAuthProtected, channelsController.deleteOneTubeById);

 
//////////////////////////////////////////////////
// MUSIC
//////////////////////////////////////////////////
// router.get("/music", isAuthProtected, isRestricted, channelsController.getAllMusic);
router.get("/music", isAuthProtected, channelsController.getAllMusic);
router.get("/music/my-music", isAuthProtected, channelsController.getAllMyMusic);
router.get("/music/:id", channelsController.getOneMusicById);
router.post("/music/upload", uploadSingleAudio, isAuthProtected, channelsController.uploadMusicAudio);

router.patch("/music/:id", isAuthProtected, channelsController.updateOneMusicById);
router.delete("/music/:id", isAuthProtected, channelsController.deleteOneMusicById);
router.get("/music/creator/:id", channelsController.getAllMusicForCreator);



//////////////////////////////////////////////////
// PODCASTS
//////////////////////////////////////////////////
// router.get("/podcasts", isAuthProtected, isRestricted, channelsController.getAllPodcasts);
router.get("/podcasts", isAuthProtected, channelsController.getAllPodcasts);
router.get("/podcasts/my-podcasts", isAuthProtected, channelsController.getAllMyPodcasts);

router.post("/podcasts/create", uploadSingleImage, isAuthProtected, channelsController.createPodcast);
router.get("/podcasts/:id", channelsController.getOnePodcastById);
router.post("/podcasts/episode/:id", uploadSingleEpisode, isAuthProtected, channelsController.uploadEpisode);

router.patch("/podcasts/:id", isAuthProtected, channelsController.updateOnePodcastById);
router.delete("/podcasts/:id", isAuthProtected, channelsController.deleteOnePodcastById);
router.get("/podcasts/creator/:id", channelsController.getAllPodcastForCreator);


////////////////////////////////////////////////// 
// BOOKS
//////////////////////////////////////////////////
router.get("/books", isAuthProtected, channelsController.getAllBooks);
router.get("/books/my-books", isAuthProtected, channelsController.getAllMyBooks);
router.post("/books/upload", uploadSingleBook, isAuthProtected, channelsController.createBook);
router.get("/books/:id", isAuthProtected, channelsController.getBookById);

router.patch("/books/:id", isAuthProtected, channelsController.updateBook);
router.delete("/books/:id", isAuthProtected, channelsController.deleteBook);
router.get("/books/creator/:id", channelsController.getAllBooksForCreator);


////////////////////////////////////////////////// 
// BLOGS
//////////////////////////////////////////////////
router.get("/blogs", isAuthProtected, channelsController.getAllBlogPosts);
router.get("/blogs/my-blogs", isAuthProtected, channelsController.getAllMyBlogPosts);
router.post("/blogs/post", isAuthProtected, channelsController.createBlogPost);
router.get("/blogs/:id", isAuthProtected, channelsController.getBlogPostById);
router.get("/blogs/creator/:id", channelsController.getAllBlogsForCreator);


////////////////////////////////////////////////// 
// PICS IMAGE
//////////////////////////////////////////////////
router.get("/pics", isAuthProtected, channelsController.getAllPics);
router.get("/pics/my-images", isAuthProtected, channelsController.getAllMyPics);

router.post("/pics/upload", uploadSingleImage, isAuthProtected, channelsController.uploadPics);
router.get("/pics/:id", isAuthProtected, channelsController.getPicsById);
router.get("/pics/creator/:id", channelsController.getAllPicsForCreator);

 
module.exports = router; 