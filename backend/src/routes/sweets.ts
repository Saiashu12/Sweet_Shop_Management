import express,{Request,Response} from 'express';
import Joi from 'joi';
import Sweet from '../models/Sweet';
import { auth } from '../middleware/auth';
import { adminAuth } from '../middleware/adminAuth';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';

const router = express.Router();

// Validation schemas
const sweetSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  category: Joi.string().required().valid('chocolate', 'candy', 'gummy', 'sweets', 'lollipop', 'cake', 'cookie', 'other'),
  price: Joi.number().required().min(0),
  quantity: Joi.number().required().min(0),
  description: Joi.string().max(500),
  imageUrl: Joi.string().uri()
});

const updateSweetSchema = sweetSchema.fork(['name', 'category', 'price', 'quantity'], schema => schema.optional());

//Get all sweets
router.get('/', auth, asyncHandler(async (req: express.Request, res: express.Response) => {
  const sweets = await Sweet.find().sort({ createdAt: -1 });
  
  res.json({
    success: true,
    data: {
      sweets,
      count: sweets.length
    }
  });
}));

// Search sweets by name, category, or price range
router.get('/search', auth, asyncHandler(async (req:Request, res:Response) => {
  const { q, category, minPrice, maxPrice, page = '1', limit = '10' } = req.query;
  
  const filter: any = {};
  
  // Text search
  if (q) {
    filter.$text = { $search: q as string };
  }
  
  // Category filter
  if (category) {
    filter.category = category;
  }
  
  // Price range filter
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = parseFloat(minPrice as string);
    if (maxPrice) filter.price.$lte = parseFloat(maxPrice as string);
  }
  
  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;
  
  const sweets = await Sweet.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);
    
  const total = await Sweet.countDocuments(filter);
  
  res.json({
    success: true,
    data: {
      sweets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    }
  });
}));

//Add a new sweet(Admin only)
router.post('/', [auth, adminAuth], asyncHandler(async (req:Request, res:Response) => {
  const { error, value } = sweetSchema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }
  
  const sweet = new Sweet(value);
  await sweet.save();
  
  res.status(201).json({
    success: true,
    message: 'Sweet created successfully',
    data: { sweet }
  });
}));

//Update a sweet(Admin only)
router.put('/:id', [auth, adminAuth], asyncHandler(async (req:Request, res:Response) => {
  const { error, value } = updateSweetSchema.validate(req.body);
  if (error) {
    throw new AppError(error.details[0].message, 400);
  }
  
  const sweet = await Sweet.findByIdAndUpdate(
    req.params.id,
    value,
    { new: true, runValidators: true }
  );
  
  if (!sweet) {
    throw new AppError('Sweet not found', 404);
  }
  
  res.json({
    success: true,
    message: 'Sweet updated successfully',
    data: { sweet }
  });
}));

// @desc    Delete a sweet(Admin only)
router.delete('/:id', [auth, adminAuth], asyncHandler(async (req:Request, res:Response) => {
  const sweet = await Sweet.findByIdAndDelete(req.params.id);
  
  if (!sweet) {
    throw new AppError('Sweet not found', 404);
  }
  
  res.json({
    success: true,
    message: 'Sweet deleted successfully'
  });
}));

//Purchase a sweet (decrease quantity)
router.post('/:id/purchase', auth, asyncHandler(async (req:Request, res:Response) => {
  const { quantity = 1 } = req.body;
  
  if (quantity <= 0) {
    throw new AppError('Quantity must be greater than 0', 400);
  }
  
  const sweet = await Sweet.findById(req.params.id);
  if (!sweet) {
    throw new AppError('Sweet not found', 404);
  }
  
  if (sweet.quantity < quantity) {
    throw new AppError('Insufficient stock', 400);
  }
  
  sweet.quantity -= quantity;
  await sweet.save();
  
  res.json({
    success: true,
    message: 'Purchase successful',
    data: { sweet }
  });
}));

//Restock a sweet (increase quantity)(Admin only)
router.post('/:id/restock', [auth, adminAuth], asyncHandler(async (req:Request, res:Response) => {
  const { quantity } = req.body;
  
  if (!quantity || quantity <= 0) {
    throw new AppError('Quantity must be greater than 0', 400);
  }
  
  const sweet = await Sweet.findById(req.params.id);
  if (!sweet) {
    throw new AppError('Sweet not found', 404);
  }
  
  sweet.quantity += quantity;
  await sweet.save();
  
  res.json({
    success: true,
    message: 'Restock successful',
    data: { sweet }
  });
}));

export default router;