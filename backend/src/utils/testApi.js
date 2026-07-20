import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('----------------------------------------------------');
  console.log('🧪 Starting CuraCare Backend API Verification Suite');
  console.log('----------------------------------------------------');

  let passedTests = 0;
  let totalTests = 0;

  const test = async (name, fn) => {
    totalTests++;
    try {
      await fn();
      console.log(`✅ Passed: ${name}`);
      passedTests++;
    } catch (err) {
      console.error(`❌ Failed: ${name}`);
      console.error(`   Error: ${err.message}`);
      if (err.actual && err.expected) {
        console.error(`   Expected: ${JSON.stringify(err.expected)}, Got: ${JSON.stringify(err.actual)}`);
      }
    }
  };

  // Test variables
  let customerToken = '';
  let adminToken = '';
  let firstProductId = '';
  let newCategoryId = '';
  let orderId = '';

  // 1. Root Ping Test
  await test('Ping Root API', async () => {
    const res = await fetch('http://localhost:5000/');
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.message.includes('CuraCare Health API'));
  });

  // 2. Fetch Categories Test
  await test('Fetch Categories list', async () => {
    const res = await fetch(`${BASE_URL}/categories`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(data));
    assert.ok(data.length > 0, 'Categories array should not be empty');
    assert.ok(data[0].name, 'Category must have a name');
  });

  // 3. Fetch Products List Test
  await test('Fetch Products list', async () => {
    const res = await fetch(`${BASE_URL}/products`);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.products, 'Response should contain products array');
    assert.ok(Array.isArray(data.products));
    assert.ok(data.products.length > 0, 'Products list should not be empty');
    firstProductId = data.products[0]._id;
  });

  // 4. Customer Login Test
  await test('Customer Login (john@gmail.com)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'john@gmail.com',
        password: 'customerpassword123',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.token, 'Should return a JWT token');
    assert.strictEqual(data.user.role, 'customer');
    customerToken = data.token;
  });

  // 5. Admin Login Test
  await test('Admin Login (zeshan1234anwar@gmail.com)', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'zeshan1234anwar@gmail.com',
        password: 'zeshan1234',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.token, 'Should return a JWT token');
    assert.strictEqual(data.user.role, 'admin');
    adminToken = data.token;
  });

  // 6. Access Profile (Protected)
  await test('Access protected Customer Profile', async () => {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.email, 'john@gmail.com');
  });

  // 7. Create Category (RBAC Validation: Admin Only)
  await test('Create Category (Admin allowed)', async () => {
    const randomName = `Device Elements ${Math.floor(Math.random() * 1000000)}`;
    const res = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: randomName,
        description: 'Healthcare devices, nebulizers, thermometers, and diagnostic kits.',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(data.name, randomName);
    newCategoryId = data._id;
  });

  // 7b. Update Category (Admin allowed)
  await test('Update Category (Admin allowed)', async () => {
    const updatedName = `Updated Device Elements ${Math.floor(Math.random() * 1000000)}`;
    const res = await fetch(`${BASE_URL}/categories/${newCategoryId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        name: updatedName,
        description: 'Updated description for elements.',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.name, updatedName);
  });

  await test('Create Category (Customer forbidden)', async () => {
    const res = await fetch(`${BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        name: 'Illegal Category',
        description: 'Should fail.',
      }),
    });
    assert.strictEqual(res.status, 403);
  });

  // 8. Manage Cart (Get & Update)
  await test('Update and Get Customer Cart', async () => {
    // Overwrite cart with first product
    const updateRes = await fetch(`${BASE_URL}/cart`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        items: [{ productId: firstProductId, quantity: 2 }],
      }),
    });
    const updateData = await updateRes.json();
    assert.strictEqual(updateRes.status, 200);
    assert.strictEqual(updateData.items.length, 1);
    assert.strictEqual(updateData.items[0].productId._id || updateData.items[0].productId, firstProductId);
    assert.strictEqual(updateData.items[0].quantity, 2);

    // Fetch cart to verify persistence
    const getRes = await fetch(`${BASE_URL}/cart`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    const getData = await getRes.json();
    assert.strictEqual(getRes.status, 200);
    assert.strictEqual(getData.items.length, 1);
  });

  // 9. Place Order & Inventory Deduction
  await test('Place Order & Deduct Inventory Stock', async () => {
    // First, let's fetch the current stock of the product
    const prodResBefore = await fetch(`${BASE_URL}/products/${firstProductId}`);
    const prodBefore = await prodResBefore.json();
    const originalStock = prodBefore.stock;

    // Place the order
    const orderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        items: [{ productId: firstProductId, name: prodBefore.name, quantity: 3, price: prodBefore.price }],
        shippingAddress: {
          street: '123 Health Ave',
          city: 'Wellness',
          state: 'FL',
          postalCode: '32100',
          country: 'USA',
          phone: '+15550199',
        },
        paymentMethod: 'cod',
        totalAmount: prodBefore.price * 3,
        tax: 0,
        shippingCharges: 0,
      }),
    });
    const orderData = await orderRes.json();
    assert.strictEqual(orderRes.status, 201);
    assert.ok(orderData.trackingNumber, 'Should generate a tracking number');
    assert.strictEqual(orderData.orderStatus, 'pending');
    orderId = orderData._id;

    // Check if stock has been reduced by 3
    const prodResAfter = await fetch(`${BASE_URL}/products/${firstProductId}`);
    const prodAfter = await prodResAfter.json();
    assert.strictEqual(prodAfter.stock, originalStock - 3, 'Stock should decrease by 3');
  });

  // 10. Post Review & Recalculate Rating
  await test('Write Product Review & Recalculate Rating', async () => {
    const reviewRes = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify({
        productId: firstProductId,
        rating: 5,
        comment: 'Absolutely amazing speed and quality!',
      }),
    });
    const reviewData = await reviewRes.json();
    if (reviewRes.status === 400 && reviewData.message?.includes('already reviewed')) {
      console.log('   (User already reviewed this product, verified uniqueness constraint)');
      return;
    }
    assert.strictEqual(reviewRes.status, 201);
    assert.strictEqual(reviewData.rating, 5);

    // Fetch product again to verify average rating calculation
    const prodRes = await fetch(`${BASE_URL}/products/${firstProductId}`);
    const prod = await prodRes.json();
    assert.ok(prod.numOfReviews > 0);
    assert.ok(prod.averageRating >= 4);
  });

  // 11. AI Recommendations Test
  await test('Get AI recommendations for symptoms', async () => {
    const res = await fetch(`${BASE_URL}/products/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symptomInput: 'I need some tablets for tough headache pain relief.',
      }),
    });
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(data.analysis, 'Response should contain symptom analysis');
    assert.ok(Array.isArray(data.recommendations), 'Response recommendations should be an array');
    assert.ok(data.recommendations.length > 0, 'Should find matching recommendations for headache');
    assert.ok(data.recommendations[0].product, 'Each recommendation should include the product object');
    assert.ok(data.recommendations[0].reason, 'Each recommendation should include a reason');
  });

  // 12. Cleanup Created Category Test
  await test('Delete Category (Admin allowed)', async () => {
    const res = await fetch(`${BASE_URL}/categories/${newCategoryId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    assert.strictEqual(res.status, 200);
  });

  console.log('----------------------------------------------------');
  console.log(`📊 Test Execution Complete: ${passedTests}/${totalTests} Passed`);
  console.log('----------------------------------------------------');

  if (passedTests === totalTests) {
    console.log('🎉 Verification successful! All routes passed.');
    process.exit(0);
  } else {
    console.error('⚠️ Verification failed with errors.');
    process.exit(1);
  }
}

runTests();
