import mongoose from 'mongoose';
import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';

// @desc    Get all products with filters, sorting, and pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      rxRequired,
      sortBy,
      isFeatured,
      isBestSeller,
      limit,
      page,
    } = req.query;

    let filter = {};

    // 1. Category filter (can be ObjectId, name, or slug)
    if (category) {
      const matchQuery = [];
      if (mongoose.isValidObjectId(category)) {
        matchQuery.push({ _id: category });
      } else {
        matchQuery.push({ slug: category });
        matchQuery.push({ name: category });
      }

      const cat = await Category.findOne({ $or: matchQuery });
      if (cat) {
        filter.category = cat._id;
      } else {
        // If category is provided but not found, return empty array
        return res.json({ products: [], page: 1, pages: 0, count: 0 });
      }
    }

    // 2. Text Search
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { genericName: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // 3. Price Filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // 4. Prescription Filter
    if (rxRequired !== undefined && rxRequired !== '') {
      filter.prescriptionRequired = rxRequired === 'true';
    }

    // 5. Featured / Best Seller Filters
    if (isFeatured !== undefined && isFeatured !== '') {
      filter.isFeatured = isFeatured === 'true';
    }
    if (isBestSeller !== undefined && isBestSeller !== '') {
      filter.isBestSeller = isBestSeller === 'true';
    }

    // 6. Sorting
    let sortOptions = { createdAt: -1 }; // default: newest
    if (sortBy) {
      if (sortBy === 'price-low-to-high') {
        sortOptions = { price: 1 };
      } else if (sortBy === 'price-high-to-low') {
        sortOptions = { price: -1 };
      } else if (sortBy === 'rating') {
        sortOptions = { averageRating: -1 };
      } else if (sortBy === 'newest') {
        sortOptions = { createdAt: -1 };
      } else if (sortBy === 'featured') {
        sortOptions = { isFeatured: -1, createdAt: -1 };
      }
    }

    // 7. Pagination
    const pageSize = Number(limit) || 12;
    const currentPage = Number(page) || 1;
    const count = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .populate('category', 'name slug')
      .sort(sortOptions)
      .limit(pageSize)
      .skip(pageSize * (currentPage - 1));

    res.json({
      products,
      page: currentPage,
      pages: Math.ceil(count / pageSize),
      count,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product details by ID or slug
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res, next) => {
  const { id } = req.params;

  try {
    let product;
    if (mongoose.isValidObjectId(id)) {
      product = await Product.findById(id).populate('category', 'name slug');
    } else {
      product = await Product.findOne({ slug: id }).populate('category', 'name slug');
    }

    if (!product) {
      res.status(404);
      return next(new Error('Product not found'));
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  const {
    name,
    genericName,
    brand,
    category,
    description,
    uses,
    sideEffects,
    dosage,
    stock,
    price,
    discount,
    images,
    prescriptionRequired,
    isFeatured,
    isBestSeller,
    expiryDate,
    batchNumber,
  } = req.body;

  try {
    const product = await Product.create({
      name,
      genericName,
      brand,
      category,
      description,
      uses,
      sideEffects,
      dosage,
      stock,
      price,
      discount,
      images,
      prescriptionRequired,
      isFeatured,
      isBestSeller,
      expiryDate,
      batchNumber,
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);

    if (!product) {
      res.status(404);
      return next(new Error('Product not found'));
    }

    // Update fields dynamically
    const fieldsToUpdate = [
      'name',
      'genericName',
      'brand',
      'category',
      'description',
      'uses',
      'sideEffects',
      'dosage',
      'stock',
      'price',
      'discount',
      'images',
      'prescriptionRequired',
      'isFeatured',
      'isBestSeller',
      'expiryDate',
      'batchNumber',
    ];

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);

    if (!product) {
      res.status(404);
      return next(new Error('Product not found'));
    }

    await product.deleteOne();
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get AI recommendations for symptoms
// @route   POST /api/products/recommendations
// @access  Public
export const getAiRecommendations = async (req, res, next) => {
  const { symptomInput } = req.body;

  if (!symptomInput || !symptomInput.trim()) {
    res.status(400);
    return next(new Error('Symptom description is required'));
  }

  try {
    const products = await Product.find({}).populate('category', 'name');

    const runFallback = () => {
      const stopWords = new Set(['i', 'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'with', 'my', 'is', 'am', 'are', 'was', 'were', 'have', 'has', 'had', 'feeling', 'feel', 'since', 'yesterday', 'today', 'need', 'something', 'please', 'help', 'get']);
      const rawKeywords = symptomInput.toLowerCase().split(/[\s,.;!?]+/);
      const keywords = rawKeywords.filter((k) => k.length >= 3 && !stopWords.has(k));

      const matched = products.filter((prod) => {
        const targetText = [
          prod.name || '',
          prod.genericName || '',
          prod.uses || '',
          prod.description || '',
          prod.category?.name || '',
        ].join(' ').toLowerCase();

        return keywords.some((key) => targetText.includes(key));
      });

      const matchedProducts = matched.map((prod) => ({
        product: prod,
        reason: `Matched relevant condition in: ${prod.uses || prod.description}`,
      }));

      return res.json({
        analysis: "Simulated keyword analysis (Add GEMINI_API_KEY to .env for generative AI recommendations).",
        recommendations: matchedProducts,
        disclaimer: "Clinical Safety Disclaimer: CuraCare AI recommendations are simulated search matches and do NOT constitute professional medical advice, prescription guidelines, or diagnosis. Always consult with a doctor before consuming drugs.",
        isFallback: true,
      });
    };

    if (!process.env.GEMINI_API_KEY) {
      return runFallback();
    }

    const catalog = products.map((p) => ({
      id: p._id,
      name: p.name,
      genericName: p.genericName,
      brand: p.brand,
      category: p.category?.name,
      description: p.description,
      uses: p.uses,
      dosage: p.dosage,
    }));

    const systemPrompt = `You are a clinical matching AI assistant for CuraCare Pharmacy. Your task is to analyze the user's symptom description and recommend matching medicines from the provided catalog.
For each recommendation, give a clear reason detailing how it helps with the user's symptoms.
Only recommend products that are relevant to the symptoms from the catalog. If no products are relevant, return an empty recommendations array.

Return a JSON object strictly matching this schema:
{
  "analysis": "A concise clinical summary of the symptom analysis and health advice.",
  "recommendations": [
    {
      "productId": "string (exact id matching the product from catalog)",
      "reason": "string (why this product is suitable for the symptom)"
    }
  ],
  "disclaimer": "Clinical safety disclaimer statement."
}

Do not include any markdown formatting or explanations outside the JSON object.

Product Catalog:
${JSON.stringify(catalog)}`;

    try {
      const candidateModels = [
        process.env.GEMINI_MODEL,
        'gemini-3.6-flash',
        'gemini-2.5-flash-lite',
        'gemini-flash-latest',
      ].filter(Boolean);

      // Deduplicate model names
      const uniqueModels = [...new Set(candidateModels)];

      let responseText = null;
      let lastError = null;

      for (const model of uniqueModels) {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [
                  {
                    role: 'user',
                    parts: [{ text: `${systemPrompt}\n\nUser Symptoms:\n${symptomInput}` }],
                  },
                ],
                generationConfig: {
                  responseMimeType: 'application/json',
                  temperature: 0.2,
                },
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (rawText) {
              responseText = rawText;
              break;
            }
          } else {
            const errorData = await response.json().catch(() => ({}));
            lastError = new Error(`Model ${model} returned status ${response.status}: ${errorData.error?.message || response.statusText}`);
          }
        } catch (modelErr) {
          lastError = modelErr;
        }
      }

      if (!responseText) {
        throw lastError || new Error('All Gemini models failed to generate a response');
      }

      let aiResponse;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiResponse = JSON.parse(jsonMatch[0]);
        } else {
          aiResponse = JSON.parse(responseText.trim());
        }
      } catch (parseErr) {
        console.error('Failed to parse Gemini JSON output:', responseText);
        throw new Error('Invalid JSON format returned by AI model');
      }

      const matchedProducts = [];
      if (aiResponse.recommendations && Array.isArray(aiResponse.recommendations)) {
        for (const rec of aiResponse.recommendations) {
          const prod = products.find(
            (p) =>
              (rec.productId && p._id.toString() === rec.productId.toString()) ||
              (rec.name && p.name.toLowerCase() === rec.name.toLowerCase()) ||
              (rec.productName && p.name.toLowerCase() === rec.productName.toLowerCase())
          );
          if (prod && !matchedProducts.some((m) => m.product._id.toString() === prod._id.toString())) {
            matchedProducts.push({
              product: prod,
              reason: rec.reason || `Recommended for reported symptoms.`,
            });
          }
        }
      }

      res.json({
        analysis: aiResponse.analysis || 'Clinical symptom analysis complete.',
        recommendations: matchedProducts,
        disclaimer:
          aiResponse.disclaimer ||
          'Clinical Safety Disclaimer: Always consult with a certified medical doctor before taking medication.',
        isFallback: false,
      });
    } catch (apiError) {
      console.warn('Gemini API call failed, falling back to local keyword matching:', apiError.message);
      return runFallback();
    }
  } catch (error) {
    next(error);
  }
};
