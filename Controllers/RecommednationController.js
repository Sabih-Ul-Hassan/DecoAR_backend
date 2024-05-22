const { exec } = require('child_process');
const Order = require('../Models/OrderModel');
const Product = require('../Models/ProductModel');

var recommend = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.params.userId })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('product')
            .exec();

        let uniqueRecommendations = [];
        for (const order of orders) {
            const product = order.product;
            let query = product.title;

            if (product.tags && product.tags.length > 0) {
                query += ' ' + product.tags.join(' ');
            }

            try {
                const recommendations = await recommendFromOne(query);

                if (recommendations && recommendations.length > 0) {
                    recommendations.forEach(recommendation => {
                        if (recommendation[1] >= 0.2 && !uniqueRecommendations.some(rec => rec[0] === recommendation[0])) {
                            uniqueRecommendations.push({ _id: recommendation[0], score: recommendation[1] });
                        }
                    });
                }
            } catch (error) {
                console.error("Error getting recommendations:", error);
            }
        }
        uniqueRecommendations = await filterRecommendationsByOrders(uniqueRecommendations, req.params.userId)
        console.log(uniqueRecommendations)
        res.json(await getProductsByIds(uniqueRecommendations));
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).send('Internal Server Error');
    }
};
const getLatestProducts = async (req, res) => {
    try {
      const products = await Product.find({deleted:false})
        .sort({ createdAt: -1 }) 
        .limit(6) 
        .select({ _id: 1, title: 1, price: 1, category: 1, images: 1, availability: 1 }) 
        .lean(); 
  
      const transformedProducts = products.map(product => ({
        ...product,
        image: product.images ? product.images[0] : null,
      }));
  
      res.json(transformedProducts);
    } catch (error) {
      console.error("Error fetching latest products:", error);
      res.status(500).send('Internal Server Error');
    }
  };
  
async function getProductsByIds(productIds) {
    try {
        const mongooseQuery = { _id: { $in: productIds },deleted:false };

        const products = await Product.find(mongooseQuery, { _id: 1, title: 1, price: 1, category: 1, images: 1, availability: 1 }).lean();
        const transformedProducts = products.map(product => ({
            ...product,
            image: product.images ? product.images[0] : null,
             
        }));
        return transformedProducts;
    } catch (error) {
        console.error("Error fetching products by IDs:", error);
        return [];
    }
}

var recommendFromOne = (query) => {
    return new Promise((resolve, reject) => {
        exec(`python ml2.py "${query}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                reject(error.message);
            }
            if (stderr) {
                console.error(`stderr: ${stderr}`);
                reject(stderr);
            }
            try {
                const recommendations = JSON.parse(stdout);
                resolve(recommendations);
            } catch (parseError) {
                reject(parseError.message);
            }
        });
    });
};

async function filterRecommendationsByOrders(recommendations, userId) {
    try {
        const orders = await Order.find({ user: userId }).distinct('product');

        const orderedProductIds = orders.map(order => order.toString());

        const filteredRecommendations = recommendations.filter(recommendation => !orderedProductIds.includes(recommendation._id.toString()));

        return filteredRecommendations.map(recommendation => recommendation._id);
    } catch (error) {
        console.error("Error filtering recommendations by orders:", error);
        return [];
    }
}

module.exports = { recommend, getLatestProducts };
