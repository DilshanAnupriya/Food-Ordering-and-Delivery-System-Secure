USE food_db;

-- Clear previous sample records if any
DELETE FROM food_items WHERE restaurant_id IN ('res-001', 'res-002', 'res-003');
DELETE FROM search_history WHERE search_id IN ('sh-001', 'sh-002', 'sh-003');
DELETE FROM restaurant WHERE restaurant_id IN ('res-001', 'res-002', 'res-003');

-- 1. Insert Sample Restaurants
INSERT INTO restaurant (
    restaurant_id, active, availability, city, closing_time, cover_image_url, 
    created_at, description, image_url, latitude, longitude, opening_time, 
    order_availability, owner_username, rating, restaurant_address, 
    restaurant_email, restaurant_name, restaurant_phone, restaurant_type, updated_at
) VALUES 
(
    'res-001', 1, 1, 'Colombo', '23:00:00', 
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    NOW(), 'Delicious Burgers, Crispy Fries & Shakes', 
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5', 
    6.9271, 79.8612, '08:00:00', 1, 'hirun', 4.8, 
    '123 Galle Road, Colombo 03', 'burgerhut@example.com', 'Burger Hut', 
    '0112345678', 'Fast Food', NOW()
),
(
    'res-002', 1, 1, 'Colombo', '22:30:00', 
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
    NOW(), 'Authentic wood-fired Italian Pizzas and Pastas', 
    'https://images.unsplash.com/photo-1513104890138-7c749659a591', 
    6.9150, 79.8580, '10:00:00', 1, 'hirun', 4.9, 
    '45 Alfred House Gardens, Colombo 03', 'pizzaparadise@example.com', 'Pizza Paradise', 
    '0118765432', 'Italian', NOW()
),
(
    'res-003', 1, 1, 'Kandy', '21:00:00', 
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
    NOW(), 'Fresh roasted coffees, cold brews, and delightful pastries', 
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb', 
    7.2906, 80.6337, '07:30:00', 1, 'hirun', 4.7, 
    '12 Peradeniya Road, Kandy', 'cafearoma@example.com', 'Cafe Aroma', 
    '0812345678', 'Beverages', NOW()
);

-- 2. Insert Sample Food Items
INSERT INTO food_items (
    food_item_id, available, category, created_at, description, discount, 
    image_url, items_name, price, restaurant_name, type, restaurant_id
) VALUES 
(
    'food-001', 1, 'Burgers', NOW(), 'Juicy grilled chicken patty with cheddar cheese and fresh veggies', 
    0, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd', 
    'Classic Chicken Burger', 1200.00, 'Burger Hut', 'Non-Veg', 'res-001'
),
(
    'food-002', 1, 'Burgers', NOW(), 'Double beef patty with special BBQ sauce and melted cheese', 
    10, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90', 
    'Double Beef Cheese Burger', 1650.00, 'Burger Hut', 'Non-Veg', 'res-001'
),
(
    'food-003', 1, 'Sides', NOW(), 'Golden crispy seasoned french fries', 
    0, 'https://images.unsplash.com/photo-1576107232684-1279f3908594', 
    'Crispy French Fries', 650.00, 'Burger Hut', 'Veg', 'res-001'
),
(
    'food-004', 1, 'Italian', NOW(), 'Fresh mozzarella, tomato sauce, basil, and extra virgin olive oil', 
    5, 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002', 
    'Margherita Pizza', 1850.00, 'Pizza Paradise', 'Veg', 'res-002'
),
(
    'food-005', 1, 'Italian', NOW(), 'Spicy pepperoni slices with melted mozzarella on sourdough crust', 
    0, 'https://images.unsplash.com/photo-1628840042765-356cda07504e', 
    'Pepperoni Supreme Pizza', 2400.00, 'Pizza Paradise', 'Non-Veg', 'res-002'
),
(
    'food-006', 1, 'Beverages', NOW(), 'Rich double shot espresso with creamy steamed milk and latte art', 
    0, 'https://images.unsplash.com/photo-1570968915860-54d5c301fa9f', 
    'Caramel Cafe Latte', 750.00, 'Cafe Aroma', 'Veg', 'res-003'
),
(
    'food-007', 1, 'Desserts', NOW(), 'Classic Italian coffee-flavoured dessert layered with mascarpone', 
    10, 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9', 
    'Classic Tiramisu', 950.00, 'Cafe Aroma', 'Veg', 'res-003'
);

-- 3. Insert Trending Search History (for Home page Popular Restaurants)
INSERT INTO search_history (search_id, latest_count_at, restaurant_name, search_count, url) 
VALUES 
('sh-001', NOW(), 'Burger Hut', 45, 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5'),
('sh-002', NOW(), 'Pizza Paradise', 38, 'https://images.unsplash.com/photo-1513104890138-7c749659a591'),
('sh-003', NOW(), 'Cafe Aroma', 29, 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb');
