    require('../models/database')
    const Category = require('../models/Category');
    const Recipe = require('../models/Recipe');
    const { search } = require('../routes/recipeRouter');

    exports.homepage = async function(req,res){
        try{

            const limitNumber = 5;
            const categories = await Category.find({}).limit(limitNumber);
            const latest = await Recipe.find({}).sort({_id: -1}).limit(limitNumber);

            const thai = await Recipe.find({'category' : 'Thai'}).limit(limitNumber)
            const american = await Recipe.find({'category' : 'American'}).limit(limitNumber)
            const chinese = await Recipe.find({'category' : 'Chinese'}).limit(limitNumber)
            const indian = await Recipe.find({'category' : 'Indian'}).limit(limitNumber)
            const food = {latest,thai,american,chinese,indian};

            
            
            res.render('index',{title: 'Home',categories,food});
        }
        catch(error){
            res.status(500).send({message:error.message} || "Error Occured");
        } 
    }

    //Get Category
    exports.exploreCategories = async function(req,res){
        try{
            const limitNumber = 6;
            const categories = await Category.find({}).limit(limitNumber);
            res.render('categories',{title: 'Categories',categories});
        }
        catch(error){
            res.status(500).send({message:error.message} || "Error Occured");
        } 
    }

    //Get About

    exports.about = async function(req,res){
        try{
            res.render('about',{title: 'About'});
        }
        catch(error){
            res.status(500).send({message:error.message} || "Error Occured");
        } 
    }

    //Get About

    exports.contact = async function(req,res){
        try{
            res.render('contact',{title: 'Contact'});
        }
        catch(error){
            res.status(500).send({message:error.message} || "Error Occured");
        } 
    }

    


    //Get Category/:id
    exports.exploreCategoriesByID = async function(req,res){
        try{

            let categoryId  = req.params.id
            const limitNumber = 5;
            const categoryByID   = await Recipe.find({'category' : categoryId}).limit(limitNumber);
            res.render('categories',{title: 'Categories',categoryByID});
        }
        catch(error){
            res.status(500).send({message:error.message} || "Error Occured");
        } 
    }

    // Get/recipe/:id
    exports.exploreRecipe = async function(req,res){
        try{
            let recipeId = req.params.id;
            const recipe = await Recipe.findById(recipeId)
            res.render('recipe',{title: 'Recipe',recipe});
        }
        catch(error){
            res.status(500).send({message:error.message} || "Error Occured");
        } 
    }

    // Get/explore-latest
    exports.exploreLatest = async function(req,res){
        try{
            const limitNumber= 20;
            const recipe  = await Recipe.find({}).sort({ _id: -1}).limit(limitNumber)
            res.render('explore-latest', {title : 'Explore-Latest', recipe});
        }
        catch(error){
            console.log(error)
            res.status(500).send({message:error.message} || "Error Occured");
        } 
    } 

    // Get/explore-random
    exports.exploreRandom = async function(req,res){
        try{
            let count = await Recipe.find({}).countDocuments();
            let random = Math.floor(Math.random() * count);
            let recipe = await Recipe.findOne().skip(random).exec();
            
            res.render('random-recipe', {title : 'Random-Recipe', recipe});
        }
        catch(error){
            console.log(error)
            res.status(500).send({message:error.message} || "Error Occured");
        } 
    } 




    // get/Submit

    exports.submitRecipe = async function(req,res) {
        const infoErrorsObject  = req.flash('infoErrors');
        const infoSubmitObject  = req.flash('infoSubmit');
        res.render('submit-recipe',{title :  'Submit Recipe',infoErrorsObject,infoSubmitObject})
        
    }

    // POST

    exports.submitRecipeOnPost = async function(req,res) {

        try{


            let imageUploadFile;
            let uploadPath;
            let newImageName;

            if(!req.files || Object.keys(req.files).length === 0){
                console.log('No files were uploaded.');
            }
            else{
                imageUploadFile = req.files.image;
                newImageName = Date.now() + imageUploadFile.name;
                
                uploadPath= require('path').resolve('./') + '/public/uploads/' + newImageName;

                imageUploadFile.mv(uploadPath,function(err){
                    if(err) {
                        return res.status(500).send(err);
                    }
                })
            }

            const newRecipe = new Recipe({
                name : req.body.name,
                description : req.body.description,
                email : req.body.email,
                ingredients : req.body.ingredients,
                category : req.body.category,
                image : newImageName
            })

            await newRecipe.save(); 
            req.flash('infoSubmit','Recipe has been added.')
            res.redirect('/submit-recipe')  
        }
        catch(error){
            res.json(error)
            req.flash('infoErrors',error)
            res.redirect('/submit-recipe') 
        }
        
    }

    // Post/search
    // Search


    exports.searchRecipe = async function(req,res){
        try{
            let searchTerm = req.body.searchTerm;
            let recipe = await Recipe.find({$text:{$search: searchTerm, $diacriticSensitive:true}});
            res.render('search',{title:'Serach',recipe})

        }
        catch(error){
            res.status(500).send({message:error.message} || "Error Occured");
        }
        
    }

    // async function updateRecipe(){
    //     try {
    //         const res = await Recipe.updateOne({name : 'Butter'},{name : 'Butter Chicken'});
    //         res.n; //Number of documents matched
    //         res.randomdified //Numbers of documents modified
    //     } catch (error) {
    //         console.lof(error);
    //     }
    // }
    // updateRecipe();


    // async function deleteRecipe(){
    //     try {
    //          await Recipe.deleteOne({name : 'Butter Chicken'});
    //     } catch (error) {
    //         console.log(error);
    //     }
    // }
    // deleteRecipe();

    // Render Edit Form
exports.renderEditForm = async function(req, res) {
    try {
        const recipeId = req.params.id;
        const recipe = await Recipe.findById(recipeId);
        if (!recipe) {
            return res.status(404).send('Recipe not found');
        }
        res.render('edit-recipe', { title: 'Edit Recipe', recipe });
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Update Recipe
exports.updateRecipe = async function(req, res) {
    try {
        const recipeId = req.params.id;
        const updatedRecipe = {
            name: req.body.name,
            description: req.body.description,
            ingredients: req.body.ingredients,
            category: req.body.category,
            // Add other fields as needed
        };

        if (req.files && req.files.image) {
            let imageUploadFile = req.files.image;
            let newImageName = Date.now() + imageUploadFile.name;
            let uploadPath = require('path').resolve('./') + '/public/uploads/' + newImageName;
            
            imageUploadFile.mv(uploadPath, function(err) {
                if (err) {
                    return res.status(500).send(err);
                }
            });

            updatedRecipe.image = newImageName;
        }

        await Recipe.findByIdAndUpdate(recipeId, updatedRecipe);
        res.redirect(`/recipe/${recipeId}`);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};

// Delete Recipe
exports.deleteRecipe = async function(req, res) {
    try {
        const recipeId = req.params.id;
        await Recipe.findByIdAndDelete(recipeId);
        res.redirect('/'); // Redirect to homepage or other page
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
};































    // async function insertCategoryData(){
    //     try{
    //         await Category.insertMany([
    //             {
    //                 "name" : "Thai",
    //                 "image" : "thai-food.jpg"
    //             },
            
    //             {
    //                 "name" : "American",
    //                 "image" : "american-food.jpg"
    //             },
            
    //             {
    //                 "name" : "Chinese",
    //                 "image" : "chinese-food.jpg"
    //             },
            
    //             {
    //                 "name" : "Mexican",
    //                 "image" : "mexican-food.jpg"
    //             },
            
    //             {
    //                 "name" : "Indian",
    //                 "image" : "indian-food.jpg"
    //             },
            
    //             {
    //                 "name" : "Spanish",
    //                 "image" : "spanish-food.jpg"
    //             }
    //         ]);
    //     } catch(error){
    //         console.log('err' + error);
    //     }
    // }

    // insertCategoryData();

    // async function insertRecipeData() {
    //     try {
    //       await Recipe.insertMany([
    //         // Indian Recipes
    //         { 
    //           "name": "Butter Chicken",
    //           "description": "Creamy and rich butter chicken with a blend of aromatic spices.",
    //           "email": "chef.indian@example.com",
    //           "ingredients": [
    //             "500g chicken breast",
    //             "1 cup yogurt",
    //             "1/2 cup cream",
    //             "2 tablespoons butter",
    //             "1 onion",
    //             "2 cloves garlic",
    //             "1 tablespoon ginger",
    //             "2 tablespoons garam masala",
    //             "1 teaspoon turmeric",
    //             "1 teaspoon cumin",
    //             "1 can tomato puree",
    //             "Salt to taste"
    //           ],
    //           "category": "Indian", 
    //           "image": "butter-chicken.jpg"
    //         },
    //         { 
    //           "name": "Paneer Tikka",
    //           "description": "Grilled paneer cubes marinated in spices and yogurt.",
    //           "email": "chef.indian2@example.com",
    //           "ingredients": [
    //             "250g paneer",
    //             "1/2 cup yogurt",
    //             "1 tablespoon ginger-garlic paste",
    //             "2 tablespoons tikka masala",
    //             "1 tablespoon lemon juice",
    //             "1 teaspoon cumin powder",
    //             "1 teaspoon paprika",
    //             "Salt to taste",
    //             "Skewers"
    //           ],
    //           "category": "Indian", 
    //           "image": "paneer-tikka.jpg"
    //         },
    //         { 
    //           "name": "Chicken Biryani",
    //           "description": "A fragrant rice dish with spiced chicken and aromatic herbs.",
    //           "email": "chef.indian3@example.com",
    //           "ingredients": [
    //             "500g chicken",
    //             "2 cups basmati rice",
    //             "1 onion",
    //             "2 tomatoes",
    //             "1/2 cup yogurt",
    //             "2 tablespoons biryani masala",
    //             "1 teaspoon turmeric",
    //             "1 teaspoon cumin",
    //             "1/4 cup chopped cilantro",
    //             "1/4 cup chopped mint",
    //             "Salt to taste"
    //           ],
    //           "category": "Indian", 
    //           "image": "chicken-biryani.jpg"
    //         },
    //         { 
    //           "name": "Chana Masala",
    //           "description": "A hearty chickpea stew cooked with tomatoes and spices.",
    //           "email": "chef.indian4@example.com",
    //           "ingredients": [
    //             "2 cups chickpeas",
    //             "1 onion",
    //             "2 tomatoes",
    //             "2 cloves garlic",
    //             "1 tablespoon ginger",
    //             "1 tablespoon cumin",
    //             "1 tablespoon coriander",
    //             "1 tablespoon garam masala",
    //             "1 teaspoon turmeric",
    //             "Salt to taste"
    //           ],
    //           "category": "Indian", 
    //           "image": "chana-masala.jpg"
    //         },
    //         // Thai Recipes
    //         { 
    //           "name": "Spicy Thai Curry",
    //           "description": "A flavorful Thai curry with coconut milk, fresh vegetables, and a spicy kick.",
    //           "email": "chef.thai@example.com",
    //           "ingredients": [
    //             "400ml coconut milk",
    //             "2 tablespoons red curry paste",
    //             "1 bell pepper",
    //             "1 zucchini",
    //             "1 carrot",
    //             "1 tablespoon fish sauce",
    //             "1 teaspoon sugar",
    //             "Fresh basil leaves"
    //           ],
    //           "category": "Thai", 
    //           "image": "spicy-thai-curry.jpg"
    //         },
    //         { 
    //           "name": "Thai Basil Chicken",
    //           "description": "A quick and tasty Thai basil chicken stir-fry with a hint of spice.",
    //           "email": "chef.thai2@example.com",
    //           "ingredients": [
    //             "300g chicken breast",
    //             "1 cup basil leaves",
    //             "2 cloves garlic",
    //             "1 tablespoon soy sauce",
    //             "1 tablespoon fish sauce",
    //             "1 teaspoon sugar",
    //             "1 red chili",
    //             "1 tablespoon vegetable oil"
    //           ],
    //           "category": "Thai", 
    //           "image": "thai-basil-chicken.jpg"
    //         },
    //         { 
    //           "name": "Pad Thai",
    //           "description": "A classic Thai noodle dish with tamarind, shrimp, and peanuts.",
    //           "email": "chef.thai3@example.com",
    //           "ingredients": [
    //             "200g rice noodles",
    //             "150g shrimp",
    //             "2 eggs",
    //             "1 cup bean sprouts",
    //             "1/4 cup crushed peanuts",
    //             "2 tablespoons tamarind paste",
    //             "2 tablespoons fish sauce",
    //             "1 tablespoon sugar",
    //             "Chopped cilantro and lime wedges for serving"
    //           ],
    //           "category": "Thai", 
    //           "image": "pad-thai.jpg"
    //         },
    //         { 
    //           "name": "Tom Yum Soup",
    //           "description": "A spicy and tangy Thai soup with shrimp and mushrooms.",
    //           "email": "chef.thai4@example.com",
    //           "ingredients": [
    //             "1 liter chicken broth",
    //             "200g shrimp",
    //             "1 cup mushrooms",
    //             "2 stalks lemongrass",
    //             "3 kaffir lime leaves",
    //             "2 Thai chilies",
    //             "2 tablespoons fish sauce",
    //             "1 tablespoon lime juice",
    //             "Coriander leaves for garnish"
    //           ],
    //           "category": "Thai", 
    //           "image": "tom-yum-soup.jpg"
    //         },
    //         // American Recipes
    //         { 
    //           "name": "American BBQ Ribs",
    //           "description": "Tender and juicy BBQ ribs glazed with a smoky, sweet barbecue sauce.",
    //           "email": "chef.bbq@example.com",
    //           "ingredients": [
    //             "1 rack of pork ribs",
    //             "1 cup BBQ sauce",
    //             "2 tablespoons brown sugar",
    //             "1 tablespoon smoked paprika",
    //             "1 teaspoon garlic powder",
    //             "Salt and pepper to taste"
    //           ],
    //           "category": "American", 
    //           "image": "american-bbq-ribs.jpg"
    //         },
    //         { 
    //           "name": "Classic Cheeseburger",
    //           "description": "A juicy cheeseburger with lettuce, tomato, and a perfectly melted cheese slice.",
    //           "email": "chef.american@example.com",
    //           "ingredients": [
    //             "500g ground beef",
    //             "4 hamburger buns",
    //             "4 slices cheddar cheese",
    //             "Lettuce leaves",
    //             "Tomato slices",
    //             "Pickles",
    //             "Ketchup and mustard"
    //           ],
    //           "category": "American", 
    //           "image": "classic-cheeseburger.jpg"
    //         },
    //         { 
    //           "name": "Buffalo Wings",
    //           "description": "Spicy buffalo wings served with celery sticks and blue cheese dressing.",
    //           "email": "chef.american2@example.com",
    //           "ingredients": [
    //             "1 kg chicken wings",
    //             "1/2 cup hot sauce",
    //             "1/4 cup melted butter",
    //             "1 teaspoon garlic powder",
    //             "1 teaspoon paprika",
    //             "Salt to taste",
    //             "Celery sticks and blue cheese dressing for serving"
    //           ],
    //           "category": "American", 
    //           "image": "buffalo-wings.jpg"
    //         },
    //         { 
    //           "name": "Macaroni and Cheese",
    //           "description": "Creamy macaroni and cheese with a crispy baked topping.",
    //           "email": "chef.american3@example.com",
    //           "ingredients": [
    //             "250g macaroni",
    //             "2 cups shredded cheddar cheese",
    //             "1/2 cup grated Parmesan cheese",
    //             "2 cups milk",
    //             "2 tablespoons butter",
    //             "2 tablespoons flour",
    //             "1/2 teaspoon paprika",
    //             "Salt and pepper to taste"
    //           ],
    //           "category": "American", 
    //           "image": "macaroni-and-cheese.jpg"
    //         },
    //         // Mexican Recipes
    //         { 
    //           "name": "Mexican Tacos",
    //           "description": "Delicious tacos filled with seasoned beef, fresh veggies, and your choice of toppings.",
    //           "email": "chef.mexican@example.com",
    //           "ingredients": [
    //             "500g ground beef",
    //             "1 packet taco seasoning",
    //             "8 taco shells",
    //             "1 cup shredded lettuce",
    //             "1 cup diced tomatoes",
    //             "1/2 cup shredded cheese",
    //             "Sour cream and salsa for serving"
    //           ],
    //           "category": "Mexican", 
    //           "image": "mexican-tacos.jpg"
    //         },
    //         { 
    //           "name": "Chicken Enchiladas",
    //           "description": "Soft tortillas filled with chicken and cheese, topped with enchilada sauce.",
    //           "email": "chef.mexican2@example.com",
    //           "ingredients": [
    //             "8 tortillas",
    //             "300g shredded chicken",
    //             "1 cup shredded cheese",
    //             "1 can enchilada sauce",
    //             "1 onion",
    //             "1 teaspoon cumin",
    //             "1 teaspoon chili powder"
    //           ],
    //           "category": "Mexican", 
    //           "image": "chicken-enchiladas.jpg"
    //         },
    //         { 
    //           "name": "Beef Burritos",
    //           "description": "Flour tortillas wrapped around a filling of seasoned beef and beans.",
    //           "email": "chef.mexican3@example.com",
    //           "ingredients": [
    //             "500g ground beef",
    //             "1 can black beans",
    //             "1 packet taco seasoning",
    //             "4 flour tortillas",
    //             "1 cup shredded cheese",
    //             "1/2 cup salsa",
    //             "Lettuce and sour cream for serving"
    //           ],
    //           "category": "Mexican", 
    //           "image": "beef-burritos.jpg"
    //         },

    //         // Chinese Recipes
    // { 
    //     "name": "Sweet and Sour Chicken",
    //     "description": "Crispy chicken pieces coated in a tangy sweet and sour sauce.",
    //     "email": "chef.chinese@example.com",
    //     "ingredients": [
    //         "500g chicken breast",
    //         "1 cup all-purpose flour",
    //         "1 egg",
    //         "1/2 cup cornstarch",
    //         "1/2 cup vinegar",
    //         "1/2 cup ketchup",
    //         "1/4 cup soy sauce",
    //         "1/4 cup sugar",
    //         "1 bell pepper",
    //         "1 onion",
    //         "1 cup pineapple chunks",
    //         "Salt and pepper to taste",
    //         "Vegetable oil for frying"
    //     ],
    //     "category": "Chinese", 
    //     "image": "sweet-and-sour-chicken.jpg"
    // },
    // { 
    //     "name": "Kung Pao Chicken",
    //     "description": "A spicy stir-fry with chicken, peanuts, and vegetables in a savory sauce.",
    //     "email": "chef.chinese2@example.com",
    //     "ingredients": [
    //         "300g chicken breast",
    //         "1/2 cup peanuts",
    //         "1 bell pepper",
    //         "1 onion",
    //         "2 cloves garlic",
    //         "1 tablespoon ginger",
    //         "3 tablespoons soy sauce",
    //         "2 tablespoons rice vinegar",
    //         "1 tablespoon hoisin sauce",
    //         "1 tablespoon chili paste",
    //         "1 teaspoon sugar",
    //         "1 tablespoon vegetable oil",
    //         "Salt to taste"
    //     ],
    //     "category": "Chinese", 
    //     "image": "kung-pao-chicken.jpg"
    // },
    // { 
    //     "name": "Beef and Broccoli",
    //     "description": "Tender beef slices stir-fried with broccoli in a savory sauce.",
    //     "email": "chef.chinese3@example.com",
    //     "ingredients": [
    //         "300g beef sirloin",
    //         "2 cups broccoli florets",
    //         "2 tablespoons soy sauce",
    //         "1 tablespoon oyster sauce",
    //         "1 tablespoon cornstarch",
    //         "2 cloves garlic",
    //         "1 tablespoon ginger",
    //         "1 tablespoon vegetable oil",
    //         "Salt and pepper to taste"
    //     ],
    //     "category": "Chinese", 
    //     "image": "beef-and-broccoli.jpg"
    // },
    // { 
    //     "name": "Fried Rice",
    //     "description": "Classic fried rice with vegetables, eggs, and a touch of soy sauce.",
    //     "email": "chef.chinese4@example.com",
    //     "ingredients": [
    //         "2 cups cooked rice",
    //         "2 eggs",
    //         "1 cup mixed vegetables (carrots, peas, corn)",
    //         "2 cloves garlic",
    //         "2 tablespoons soy sauce",
    //         "1 tablespoon vegetable oil",
    //         "2 green onions",
    //         "Salt and pepper to taste"
    //     ],
    //     "category": "Chinese", 
    //     "image": "fried-rice.jpg"
    // }

            
    //       ])  ;  
    //     }catch (error) {
    //       console.log('Error:', error);
    //     }
    //   }
    
    //   insertRecipeData();
    