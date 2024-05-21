var ProductModel = require("../Models/ProductModel")
var UserModel = require("../Models/UserModel")
var productSuggestions = async (req,res)=> {
  try {
    const query  = req.params.query;

    // Split the query based on spaces
    const queryArray = query.split(' ');

    const titles = await ProductModel.find({
      $or: [
        { title: { $regex: new RegExp(query, 'i') } },
        { description: { $regex: new RegExp(query, 'i') } }
      ],
    },  { title: 1, _id: 0 } )
      .limit(7)
      .then((products) => products.map((product) => product.title));


    res.json(titles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// const searchProducts = async (req, res) => { // older, works!
//     try {
//       const searchQuery = req.params.query;
//       const tags = searchQuery.split(' ');
//       const mongooseQuery = {
//         $or: [
//           { title: { $regex: searchQuery, $options: 'i' } },
//           { description: { $regex: searchQuery, $options: 'i' } },
//           { tags: { $all: tags } },
//           { category: searchQuery }
//         ]
//       };
//      const products = await ProductModel.find(mongooseQuery,{_id:1,title:1,price:1,category:1,images:1,availability:1}).lean();  
//         const transformedProducts = products.map(product => ({
//         ...product,
//         image: product.images ? product.images[0] : null,
//       }));
  
//       res.json(transformedProducts);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ success: false, error: 'Internal Server Error' });
//     }
//   };
  
const searchProducts = async (req, res) => { // newer! works? idk!
  try {
    const { title, minPrice, maxPrice, category, sortBy } = req.query;

    let mongooseQuery = {};

    if (title) {
      const tags = title.split(' ');
      mongooseQuery.$or = [
        { title: { $regex: title, $options: 'i' } },
        { description: { $regex: title, $options: 'i' } },
        { tags: { $all: tags } }
      ];
    }

    if (minPrice && maxPrice) {
      mongooseQuery.price = { $gte: minPrice, $lte: maxPrice };
    } else if (minPrice) {
      mongooseQuery.price = { $gte: minPrice };
    } else if (maxPrice) {
      mongooseQuery.price = { $lte: maxPrice };
    }

    if (category) {
      mongooseQuery.category = category;
    }

    let sortOption = {};

    if (sortBy) {
      switch (sortBy) {
        case 'Price Low to High':
          sortOption = { price: 1 };
          break;
        case 'Price High to Low':
          sortOption = { price: -1 };
          break;
        case 'Date Added':
          sortOption = { createdAt: -1 };
          break;
        default:
          break;
      }
    }

    const items = await ProductModel.find(mongooseQuery).sort(sortOption);

    const transformedItems = items.map(item => ({
      ...item.toObject(),
      image: item.images ? item.images[0] : null,
    }));

    res.json(transformedItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

  const  filter = async (req, res) => {
    try {
      const { title, minPrice, maxPrice, category, sortBy, } = req.query;
  
      let filter = {};
      if (title) filter.title = title;
      if (minPrice) filter.price = { $gte: minPrice };
      if (maxPrice) filter.price = { ...filter.price, $lte: maxPrice };
      if (category) filter.category = category;
  
      
        filter.$or = [
          { title: { $regex: title, $options: 'i' } },
          { description: { $regex: title, $options: 'i' } },
          { tags: { $all: title.split(' ') } },
          { category: title }
        ];
      
  
      let sort = {};
      if (sortBy === 'Price Low to High') sort = { price: 1 };
      else if (sortBy === 'Price High to Low') sort = { price: -1 };
      else if (sortBy === 'Date Added') sort = { createdAt: -1 };
  
      const products = await ProductModel.find(filter, { _id: 1, title: 1, price: 1, category: 1, images: 1, availability: 1 }).sort(sort).lean();
      const transformedProducts = products.map(product => ({
        ...product,
        image: product.images ? product.images[0] : null,
      }));
  
      res.json(transformedProducts);
    } catch (error) {
      console.error('Error processing filter:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  var searchUsers = async (req, res) => {
    try {
      console.log(req.params)
      const { userName } = req.params; 
      const users = await UserModel.find({ name: { $regex: userName, $options: 'i' }, deleted:false}).lean(); 
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
  }

module.exports = { productSuggestions, searchProducts , filter,searchUsers}
