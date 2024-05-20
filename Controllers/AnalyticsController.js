const Product = require('../Models/ProductModel');
const Review = require('../Models/ReviewModel');
const Order = require('../Models/OrderModel');
const mongoose = require('mongoose');
const moment = require('moment');


const filterProducts = async (req, res) => {
  try { 
    var userId = req.params.userId
    console.log(userId);
    let filters = {userId: new mongoose.Types.ObjectId(userId)}; 
    console.log(filters);
      if (req.query.date ) {

          let dateFilter = {};

          switch (req.query.date) {
              case 'last_year':
                  dateFilter = { $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) };
                  break;
              case 'last_month':
                  dateFilter = { $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) };
                  break;
              case 'last_week':
                  dateFilter = { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) };
                  break;
          }

        if(req.query.date!="all_times")  filters.createdAt = dateFilter;
      }

      if (req.query.category) {
          filters.category = req.query.category;
      }

      if (req.query.minPrice || req.query.maxPrice) {
        filters.price = {};
        if (req.query.minPrice) {
          filters.price.$gte = parseInt(req.query.minPrice);
        }
        if (req.query.maxPrice) {
          filters.price.$lte = parseInt(req.query.maxPrice);
        }
      }
      console.log(filters);
      let aggregationPipeline = [
        {
          $match: filters 
        },
          {
              $lookup: {
                  from: 'orders',
                  localField: '_id',
                  foreignField: 'product',
                  as: 'orders'
              }
          },
          {
              $addFields: {
                  cancelledOrders: {
                      $sum: {
                          $map: {
                              input: {
                                  $filter: {
                                      input: '$orders',
                                      as: 'order',
                                      cond: { $eq: ['$$order.status', 'Cancelled'] }
                                  }
                              },
                              as: 'order',
                              in: '$$order.quantity'
                          }
                      }
                  },
                  validOrders: {
                      $sum: {
                          $map: {
                              input: {
                                  $filter: {
                                      input: '$orders',
                                      as: 'order',
                                      cond: { $ne: ['$$order.status', 'Cancelled'] }
                                  }
                              },
                              as: 'order',
                              in: '$$order.quantity'
                          }
                      }
                  },
                  totalOrders: {
                      $sum: '$orders.quantity'
                  },
                  totalSale: {
                    $multiply: ['$price', {
                        $sum: {
                            $map: {
                                input: {
                                    $filter: {
                                        input: '$orders',
                                        as: 'order',
                                        cond: { $ne: ['$$order.status', 'Cancelled'] }
                                    }
                                },
                                as: 'order',
                                in: '$$order.quantity'
                            }
                        }
                    }]
                }
              }  
          },
          {
            $lookup: {
                from: 'reviews',
                localField: '_id',
                foreignField: 'productId',
                as: 'reviews'
            }
        },
        {
            $addFields: {
                averageRating: { $avg: '$reviews.stars' }
            }
        },
          {
              $project: {
                  _id:0,
                  title: 1,
                  price: 1,
                  availability: 1,
                  category: 1,
                  totalOrders: 1,
                  cancelledOrders: 1,
                  totalValidOrders: '$validOrders',
                  totalSale: 1,
                  averageRating:1
              }
          }
      ];

       

      if (req.query.sortBy === 'most_selling') {
          aggregationPipeline.push({
              $sort: { totalValidOrders: -1 }
          });
      } else if (req.query.sortBy === 'most_revenue') {
          aggregationPipeline.push({
              $sort: { totalSale: -1 }
          });
      }
      console.log(await Product.aggregate([{$match:filters}]));
      let products = await Product.aggregate(aggregationPipeline);

      res.json(products);
  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server Error' });
  }
}


var getOrderCount = async (req,res) => {
    var {userId, date} = req.params;
    var startDate =new Date() ;
    var endDate  =new Date()   ;

    switch (date) {
        case 'thisWeek':
            startDate.setDate(startDate.getDate() - startDate.getDay());
            endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
            break;
        case 'thisMonth':
            startDate.setDate(1);
            endDate.setMonth(endDate.getMonth() + 1);
            endDate.setDate(0);
            break;
        case 'thisYear':
            startDate.setMonth(0);
            startDate.setDate(1);
            endDate.setMonth(11);
            endDate.setDate(31);
            break;
        default:
            break;
    }
    var filter  = { seller: new mongoose.Types.ObjectId(userId),  status: { $ne: 'Cancelled' } };
    if(date != "allTime")
        filter={...filter,  createdAt: { $gte: startDate, $lte: endDate }, }
    const groupedOrders = await Order.aggregate([
        { 
            $match: filter
        },
        {
            $group: {
                _id: {
                    $cond: {
                        if: { $eq: [date, 'thisWeek'] },
                        then: { $dayOfWeek: '$createdAt' },
                        else: { 
                            $cond: {
                                if: { $eq: [date, 'thisMonth'] },
                                then: { $dayOfMonth: '$createdAt' },
                                else: { 
                                    $cond: {
                                        if: { $eq: [date, 'thisYear'] },
                                        then: { $month: '$createdAt' },
                                        else: { $year: '$createdAt' }
                                    }
                                }
                            }
                        }
                    }
                },
                totalPrice: { $sum: '$quantity' }
            }
        }
    ]);
    if(date=="thisYear")
        res.json(replaceWithMonthNames(groupedOrders));
    else if(date=="thisMonth")
        {
            res.json(replaceWithdaysMonth(groupedOrders));
        }
        else{
        res.json(groupedOrders.map(x=> {return {"value":x.totalPrice,"name":x._id};}));
    }
};

var getNumberOfCancelledOrders = async (req,res) => {
    var {userId, date} = req.params;
    var startDate =new Date() ;
    var endDate  =new Date()   ;

    switch (date) {
        case 'thisWeek':
            startDate.setDate(startDate.getDate() - startDate.getDay());
            endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
            break;
        case 'thisMonth':
            startDate.setDate(1);
            endDate.setMonth(endDate.getMonth() + 1);
            endDate.setDate(0);
            break;
        case 'thisYear':
            startDate.setMonth(0);
            startDate.setDate(1);
            endDate.setMonth(11);
            endDate.setDate(31);
            break;
        default:
            break;
    }
    var filter  = { seller: new mongoose.Types.ObjectId(userId),  status: { $eq: 'Cancelled' } };
    if(date != "allTime")
        filter={...filter,  createdAt: { $gte: startDate, $lte: endDate }, }
    const groupedOrders = await Order.aggregate([
        { 
            $match: filter
        },
        {
            $group: {
                _id: {
                    $cond: {
                        if: { $eq: [date, 'thisWeek'] },
                        then: { $dayOfWeek: '$createdAt' },
                        else: { 
                            $cond: {
                                if: { $eq: [date, 'thisMonth'] },
                                then: { $dayOfMonth: '$createdAt' },
                                else: { 
                                    $cond: {
                                        if: { $eq: [date, 'thisYear'] },
                                        then: { $month: '$createdAt' },
                                        else: { $year: '$createdAt' }
                                    }
                                }
                            }
                        }
                    }
                },
                totalPrice: { $sum: '$quantity' }
            }
        }
    ]);
    if(date=="thisYear")
        res.json(replaceWithMonthNames(groupedOrders));
    else if(date=="thisMonth")
        {
            res.json(replaceWithdaysMonth(groupedOrders));
        }
        else{
        res.json(groupedOrders.map(x=> {return {"value":x.totalPrice,"name":x._id};}));
    }
};

  const replaceWithMonthNames = (monthTotals) => {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const result = [];

    for (let i = 1; i <= 12; i++) {
        const monthIndex = monthTotals.findIndex(item => item._id === i);
        if (monthIndex !== -1) {
            result.push({
                name: monthNames[i - 1],
                value: monthTotals[monthIndex].totalPrice
            });
        } else {
            result.push({
                name: monthNames[i - 1],
                value: 0
            });
        }
    }

    return result;
};
  
  const replaceWithdaysMonth = (monthTotals) => {
    

    const result = [];

    for (let i = 1; i <= 31; i++) {
        const monthIndex = monthTotals.findIndex(item => item._id === i);
        if (monthIndex !== -1) {
            result.push({
                name: i,
                value: monthTotals[monthIndex].totalPrice
            });
        } else {
            result.push({
                name: i,
                value: 0
            });
        }
    }

    return result;
};
 
  var getOrderStats = async (req,res) => {
    var {userId, date} = req.params;
    var startDate =new Date() ;
    var endDate  =new Date()   ;

    switch (date) {
        case 'thisWeek':
            startDate.setDate(startDate.getDate() - startDate.getDay());
            endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
            break;
        case 'thisMonth':
            startDate.setDate(1);
            endDate.setMonth(endDate.getMonth() + 1);
            endDate.setDate(0);
            break;
        case 'thisYear':
            startDate.setMonth(0);
            startDate.setDate(1);
            endDate.setMonth(11);
            endDate.setDate(31);
            break;
        default:
            break;
    }
    var filter  = { seller: new mongoose.Types.ObjectId(userId),  status: { $ne: 'Cancelled' } };
    if(date != "allTime")
        filter={...filter,  createdAt: { $gte: startDate, $lte: endDate }, }
    const groupedOrders = await Order.aggregate([
        { 
            $match: filter
        },
        {
            $group: {
                _id: {
                    $cond: {
                        if: { $eq: [date, 'thisWeek'] },
                        then: { $dayOfWeek: '$createdAt' },
                        else: { 
                            $cond: {
                                if: { $eq: [date, 'thisMonth'] },
                                then: { $dayOfMonth: '$createdAt' },
                                else: { 
                                    $cond: {
                                        if: { $eq: [date, 'thisYear'] },
                                        then: { $month: '$createdAt' },
                                        else: { $year: '$createdAt' }
                                    }
                                }
                            }
                        }
                    }
                },
                totalPrice: { $sum: '$totalPrice' }
            }
        }
    ]);
    if(date=="thisYear")
        res.json(replaceWithMonthNames(groupedOrders));
    else if(date=="thisMonth")
        {
            res.json(replaceWithdaysMonth(groupedOrders));
        }
        else{
        res.json(groupedOrders.map(x=> {return {"value":x.totalPrice,"name":x._id};}));
    }
};

  
  

module.exports = { filterProducts, getOrderStats, getOrderCount, getNumberOfCancelledOrders };
