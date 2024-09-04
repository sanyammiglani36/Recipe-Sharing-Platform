const express = require('express');
const router = express.Router();
const recipeController  = require('../controllers/recipeController'); 

router.get('/',recipeController.homepage);
router.get('/recipe/:id',recipeController.exploreRecipe)
router.get('/categories',recipeController.exploreCategories);
router.get('/categories/:id',recipeController.exploreCategoriesByID);
router.post('/search',recipeController.searchRecipe);
router.get('/explore-latest', recipeController.exploreLatest);
router.get('/explore-recipe',recipeController.exploreLatest);
router.get('/random-recipe',recipeController.exploreRandom);
router.get('/submit-recipe',recipeController.submitRecipe);
router.post('/submit-recipe',recipeController.submitRecipeOnPost);
router.get('/about',recipeController.about)
router.get('/contact',recipeController.contact)
router.get('/recipe/:id/edit', recipeController.renderEditForm);

// Route to handle updating recipe
router.post('/recipe/:id/edit', recipeController.updateRecipe);

// Route to handle deleting recipe
router.post('/recipe/:id/delete', recipeController.deleteRecipe)


module.exports = router;