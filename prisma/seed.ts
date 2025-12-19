import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create demo users for reviews
  const hashedPassword = await bcrypt.hash('demo123', 12)
  
  const testUser = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: { role: 'ADMIN' },
    create: {
      name: 'Demo User',
      email: 'demo@example.com',
      password: hashedPassword,
      isVerified: true,
      role: 'ADMIN'
    }
  })

  const reviewer1 = await prisma.user.upsert({
    where: { email: 'customer1@example.com' },
    update: {},
    create: {
      name: 'Priya Sharma',
      email: 'customer1@example.com',
      password: hashedPassword,
      isVerified: true
    }
  })

  const reviewer2 = await prisma.user.upsert({
    where: { email: 'customer2@example.com' },
    update: {},
    create: {
      name: 'Rahul Verma',
      email: 'customer2@example.com',
      password: hashedPassword,
      isVerified: true
    }
  })

  const reviewer3 = await prisma.user.upsert({
    where: { email: 'customer3@example.com' },
    update: {},
    create: {
      name: 'Anita Patel',
      email: 'customer3@example.com',
      password: hashedPassword,
      isVerified: true
    }
  })

  console.log('Created demo users')

  // Create API key for external integrations
  await prisma.apiKey.upsert({
    where: { key: '37d07e0a2a290644cf9c3e731462128e741abda974c3ae882367c483893b521a' },
    update: {},
    create: {
      key: '37d07e0a2a290644cf9c3e731462128e741abda974c3ae882367c483893b521a',
      name: 'Shopping Agent API Key',
      description: 'API key for shopping agent integration',
      isActive: true
    }
  })

  console.log('Created API key')

  // Comprehensive product catalog with Indian and Western items
  const sampleProducts = [
    // Men's Indian Traditional Wear
    {
      id: 'silk-kurta-1',
      name: 'Royal Blue Silk Kurta',
      description: 'Elegant royal blue silk kurta perfect for festive occasions with intricate embroidery',
      price: 2999,
      category: 'men',
      image: '/royal-blue-silk-kurta-for-men.png',
      images: JSON.stringify(['/royal-blue-silk-kurta-for-men.png', '/royal-blue-silk-kurta.png']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL'])
    },
    {
      id: 'sherwani-1',
      name: 'Burgundy Silk Sherwani',
      description: 'Premium silk sherwani with golden embroidery for weddings',
      price: 7999,
      category: 'men',
      image: '/burgundy-silk-sherwani.png',
      images: JSON.stringify(['/burgundy-silk-sherwani.png', '/maroon-velvet-sherwani-with-gold-embroidery.png']),
      sizes: JSON.stringify(['38', '40', '42', '44', '46'])
    },
    {
      id: 'dhoti-kurta-1',
      name: 'Traditional White Dhoti Kurta Set',
      description: 'Traditional white dhoti kurta set for festivals and ceremonies',
      price: 1999,
      category: 'men',
      image: '/traditional-white-dhoti.png',
      images: JSON.stringify(['/traditional-white-dhoti.png', '/traditional-white-cotton-dhoti.png']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL'])
    },
    {
      id: 'nehru-jacket-1',
      name: 'Embroidered Nehru Jacket',
      description: 'Contemporary Nehru jacket with traditional embroidery',
      price: 5999,
      category: 'men',
      image: '/nehru-jacket.png',
      images: JSON.stringify(['/nehru-jacket.png', '/embroidered-waistcoat.png']),
      sizes: JSON.stringify(['38', '40', '42', '44', '46'])
    },
    {
      id: 'formal-shirt-1',
      name: 'White Cotton Formal Shirt',
      description: 'Premium cotton formal shirt for office wear',
      price: 1499,
      category: 'men',
      image: '/white-cotton-formal-shirt.png',
      images: JSON.stringify(['/white-cotton-formal-shirt.png', '/mens-white-cotton-dress-shirt.png']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL'])
    },
    {
      id: 'formal-trousers-1',
      name: 'Black Formal Trousers',
      description: 'Slim fit formal trousers for professional look',
      price: 1799,
      category: 'men',
      image: '/black-formal-trousers-for-men-office-wear.png',
      images: JSON.stringify(['/black-formal-trousers.png', '/black-formal-trousers-for-men-office-wear.png']),
      sizes: JSON.stringify(['30', '32', '34', '36', '38', '40'])
    },
    {
      id: 'mens-leather-jacket-1',
      name: 'Black Leather Jacket',
      description: 'Premium black leather jacket for casual and formal occasions',
      price: 8999,
      category: 'men',
      image: '/mens-black-leather-jacket.png',
      images: JSON.stringify(['/mens-black-leather-jacket.png']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL'])
    },
    {
      id: 'mens-jeans-1',
      name: 'Dark Blue Slim Fit Jeans',
      description: 'Comfortable dark blue slim fit jeans for casual wear',
      price: 1999,
      category: 'men',
      image: '/mens-dark-blue-slim-fit-jeans.png',
      images: JSON.stringify(['/mens-dark-blue-slim-fit-jeans.png']),
      sizes: JSON.stringify(['30', '32', '34', '36', '38', '40'])
    },
    {
      id: 'cotton-saree-1',
      name: 'Blue Georgette Saree',
      description: 'Beautiful blue georgette saree with floral print',
      price: 1999,
      category: 'women',
      image: '/blue-georgette-saree-with-floral-print.png',
      images: JSON.stringify(['/blue-georgette-saree.png', '/blue-georgette-saree-with-floral-print.png']),
      sizes: JSON.stringify(['Free Size'])
    },
    {
      id: 'banarasi-saree-1',
      name: 'Red Banarasi Silk Saree',
      description: 'Luxurious red Banarasi silk saree with golden border',
      price: 4999,
      category: 'women',
      image: '/red-banarasi-silk-saree-with-gold-border.png',
      images: JSON.stringify(['/red-banarasi-silk-saree.png', '/red-banarasi-silk-saree-with-gold-border.png']),
      sizes: JSON.stringify(['Free Size'])
    },
    {
      id: 'anarkali-suit-1',
      name: 'Green Anarkali Salwar Suit',
      description: 'Elegant green anarkali suit with dupatta for special occasions',
      price: 3499,
      category: 'women',
      image: '/green-anarkali-salwar-suit.png',
      images: JSON.stringify(['/green-anarkali-suit.png', '/green-anarkali-salwar-suit.png']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL', 'XXL'])
    },
    {
      id: 'cotton-kurti-1',
      name: 'Cotton Printed Kurti',
      description: 'Comfortable cotton kurti with floral print',
      price: 999,
      category: 'women',
      image: '/cotton-printed-kurti-with-floral-design.png',
      images: JSON.stringify(['/cotton-printed-kurti.png', '/cotton-printed-kurti-with-floral-design.png']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL'])
    },
    {
      id: 'block-print-kurti-1',
      name: 'Block Print Cotton Kurti',
      description: 'Traditional block print kurti in premium cotton',
      price: 1299,
      category: 'women',
      image: '/block-print-cotton-kurti.png',
      images: JSON.stringify(['/block-print-cotton-kurti.png']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL'])
    },
    {
      id: 'chanderi-dupatta-1',
      name: 'Chanderi Silk Dupatta',
      description: 'Pure chanderi silk dupatta with golden border',
      price: 1899,
      category: 'women',
      image: '/chanderi-silk-dupatta.png',
      images: JSON.stringify(['/chanderi-silk-dupatta.png']),
      sizes: JSON.stringify(['Free Size'])
    },
    {
      id: 'palazzo-suit-1',
      name: 'Palazzo Pants Set',
      description: 'Comfortable palazzo pants set for casual and formal wear',
      price: 2499,
      category: 'women',
      image: '/palazzo-pants-set.png',
      images: JSON.stringify(['/palazzo-pants-set.png']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL'])
    },
    {
      id: 'fusion-jacket-dress-1',
      name: 'Indo-Western Fusion Dress',
      description: 'Modern fusion jacket dress combining Indian and Western styles',
      price: 2499,
      category: 'women',
      image: '/fusion-jacket-dress.png',
      images: JSON.stringify(['/fusion-jacket-dress.png']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL'])
    },
    {
      id: 'indo-western-crop-top-1',
      name: 'Indo-Western Crop Top Set',
      description: 'Stylish crop top and skirt set with ethnic touch',
      price: 1999,
      category: 'women',
      image: '/indo-western-crop-top-and-skirt-set.png',
      images: JSON.stringify(['/indo-western-crop-top.png', '/indo-western-crop-top-and-skirt-set.png']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL'])
    },
    {
      id: 'womens-summer-dress-1',
      name: 'Floral Summer Dress',
      description: 'Light and comfortable floral summer dress',
      price: 1799,
      category: 'women',
      image: '/womens-floral-summer-dress.png',
      images: JSON.stringify(['/womens-floral-summer-dress.png']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL'])
    },
    {
      id: 'womens-silk-blouse-1',
      name: 'White Silk Blouse',
      description: 'Elegant white silk blouse for formal occasions',
      price: 1499,
      category: 'women',
      image: '/womens-white-silk-blouse.png',
      images: JSON.stringify(['/womens-white-silk-blouse.png']),
      sizes: JSON.stringify(['S', 'M', 'L', 'XL'])
    },
    {
      id: 'womens-trousers-1',
      name: 'Black High Waist Trousers',
      description: 'Stylish black high waist trousers for office wear',
      price: 1599,
      category: 'women',
      image: '/womens-black-high-waist-trousers.png',
      images: JSON.stringify(['/womens-black-high-waist-trousers.png']),
      sizes: JSON.stringify(['26', '28', '30', '32', '34'])
    },
    {
      id: 'boys-kurta-pajama-1',
      name: 'Boys Kurta Pajama Set',
      description: 'Comfortable cotton kurta pajama set for boys',
      price: 899,
      category: 'children',
      image: '/boys-kurta-pajama-set-in-cream-color.png',
      images: JSON.stringify(['/boys-kurta-pajama-set.png', '/boys-kurta-pajama-set-in-cream-color.png']),
      sizes: JSON.stringify(['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y'])
    },
    {
      id: 'boys-bandhgala-1',
      name: 'Boys Bandhgala Set',
      description: 'Stylish bandhgala set for special occasions',
      price: 1499,
      category: 'children',
      image: '/boys-bandhgala-set.png',
      images: JSON.stringify(['/boys-bandhgala-set.png']),
      sizes: JSON.stringify(['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y'])
    },
    {
      id: 'boys-casual-shirt-1',
      name: 'Boys Casual Shirt',
      description: 'Comfortable cotton shirt for daily wear',
      price: 599,
      category: 'children',
      image: '/boys-casual-shirt.png',
      images: JSON.stringify(['/boys-casual-shirt.png']),
      sizes: JSON.stringify(['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y'])
    },
    {
      id: 'girls-lehenga-1',
      name: 'Girls Pink Lehenga Choli',
      description: 'Beautiful lehenga choli set for festivals',
      price: 1799,
      category: 'children',
      image: '/girls-pink-lehenga-choli-with-embroidery.png',
      images: JSON.stringify(['/girls-lehenga-choli.png', '/girls-pink-lehenga-choli-with-embroidery.png']),
      sizes: JSON.stringify(['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y'])
    },
    {
      id: 'girls-anarkali-1',
      name: 'Girls Anarkali Dress',
      description: 'Elegant anarkali dress for special occasions',
      price: 1299,
      category: 'children',
      image: '/girls-anarkali-dress.png',
      images: JSON.stringify(['/girls-anarkali-dress.png']),
      sizes: JSON.stringify(['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y'])
    },
    {
      id: 'girls-party-dress-1',
      name: 'Girls Pink Party Dress',
      description: 'Stylish party dress for special events',
      price: 999,
      category: 'children',
      image: '/girls-pink-party-dress.png',
      images: JSON.stringify(['/girls-pink-party-dress.png']),
      sizes: JSON.stringify(['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y'])
    },
    {
      id: 'girls-denim-skirt-1',
      name: 'Girls Denim Skirt',
      description: 'Casual denim skirt for everyday wear',
      price: 799,
      category: 'children',
      image: '/girls-denim-skirt.png',
      images: JSON.stringify(['/girls-denim-skirt.png']),
      sizes: JSON.stringify(['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y'])
    },
    {
      id: 'girls-ghagra-1',
      name: 'Girls Ghagra Set',
      description: 'Traditional ghagra choli set',
      price: 1599,
      category: 'children',
      image: '/girls-ghagra-set.png',
      images: JSON.stringify(['/girls-ghagra-set.png']),
      sizes: JSON.stringify(['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y'])
    },
    {
      id: 'girls-sharara-1',
      name: 'Girls Sharara Set',
      description: 'Elegant sharara set for festivals',
      price: 1399,
      category: 'children',
      image: '/girls-sharara-set.png',
      images: JSON.stringify(['/girls-sharara-set.png']),
      sizes: JSON.stringify(['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y'])
    },
    {
      id: 'kids-tshirt-1',
      name: 'Kids Colorful T-Shirt',
      description: 'Comfortable cotton t-shirt with colorful design',
      price: 499,
      category: 'children',
      image: '/kids-colorful-cotton-tshirt.png',
      images: JSON.stringify(['/kids-cotton-tshirt.png', '/kids-colorful-cotton-tshirt.png']),
      sizes: JSON.stringify(['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y'])
    },
    {
      id: 'kids-denim-jacket-1',
      name: 'Kids Denim Jacket',
      description: 'Stylish denim jacket for casual wear',
      price: 899,
      category: 'children',
      image: '/kids-blue-denim-jacket.png',
      images: JSON.stringify(['/kids-denim-jacket.png', '/kids-blue-denim-jacket.png']),
      sizes: JSON.stringify(['2-3Y', '4-5Y', '6-7Y', '8-9Y', '10-11Y'])
    },
    {
      id: 'men-formal-shoes-1',
      name: 'Premium Leather Formal Shoes',
      description: 'Genuine leather formal shoes for office and formal events',
      price: 3999,
      category: 'men',
      image: '/mens-leather-formal-shoes.jpg',
      images: JSON.stringify(['/mens-leather-formal-shoes.jpg']),
      sizes: JSON.stringify(['6', '7', '8', '9', '10', '11'])
    },
    {
      id: 'men-ethnic-mojari-1',
      name: 'Traditional Leather Mojari',
      description: 'Handcrafted leather mojari with ethnic design',
      price: 1799,
      category: 'men',
      image: '/mens-traditional-mojaris.jpg',
      images: JSON.stringify(['/mens-traditional-mojaris.jpg']),
      sizes: JSON.stringify(['6', '7', '8', '9', '10', '11'])
    },
    {
      id: 'women-ethnic-sandals-1',
      name: 'Traditional Ethnic Sandals',
      description: 'Comfortable ethnic sandals with traditional design',
      price: 1499,
      category: 'women',
      image: '/womens-ethnic-sandals.jpg',
      images: JSON.stringify(['/womens-ethnic-sandals.jpg']),
      sizes: JSON.stringify(['5', '6', '7', '8', '9'])
    },
    {
      id: 'leather-handbag-1',
      name: 'Embroidered Handbag',
      description: 'Elegant embroidered handbag for professional and casual use',
      price: 2999,
      category: 'women',
      image: '/womens-embroidered-handbag.jpg',
      images: JSON.stringify(['/womens-embroidered-handbag.jpg']),
      sizes: JSON.stringify(['One Size'])
    },
    {
      id: 'mens-leather-belt-1',
      name: 'Genuine Leather Belt',
      description: 'Premium leather belt for formal and casual wear',
      price: 999,
      category: 'men',
      image: '/mens-leather-belt.jpg',
      images: JSON.stringify(['/mens-leather-belt.jpg']),
      sizes: JSON.stringify(['32', '34', '36', '38', '40'])
    },
    {
      id: 'womens-jewelry-set-1',
      name: 'Traditional Ethnic Jewelry Set',
      description: 'Beautiful ethnic jewelry set for traditional wear',
      price: 1499,
      category: 'women',
      image: '/womens-ethnic-jewelry-set.jpg',
      images: JSON.stringify(['/womens-ethnic-jewelry-set.jpg']),
      sizes: JSON.stringify(['One Size'])
    },
    {
      id: 'men-watch-1',
      name: 'Traditional Watch',
      description: 'Stylish traditional watch for men',
      price: 2499,
      category: 'men',
      image: '/mens-traditional-watch.jpg',
      images: JSON.stringify(['/mens-traditional-watch.jpg']),
      sizes: JSON.stringify(['One Size'])
    },
    {
      id: 'mens-silk-pocket-square-1',
      name: 'Silk Pocket Square',
      description: 'Premium silk pocket square for formal occasions',
      price: 799,
      category: 'men',
      image: '/mens-silk-pocket-square.jpg',
      images: JSON.stringify(['/mens-silk-pocket-square.jpg']),
      sizes: JSON.stringify(['One Size'])
    }
  ]

  for (const product of sampleProducts) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {},
      create: {
        ...product,
        basePrice: product.price
      }
    })
  }

  console.log('Added sample products')

  // Mock reviews for products
  const reviews = [
    // Men's Traditional Wear Reviews
    { userId: reviewer1.id, productId: 'silk-kurta-1', rating: 5, comment: 'Excellent quality silk kurta! Perfect fit and great fabric. Highly recommend for festivals.' },
    { userId: reviewer2.id, productId: 'silk-kurta-1', rating: 4, comment: 'Beautiful blue color and comfortable to wear. Embroidery work is really nice.' },
    { userId: reviewer1.id, productId: 'sherwani-1', rating: 5, comment: 'Stunning sherwani for my wedding! The embroidery work is exquisite. Worth every penny.' },
    { userId: reviewer3.id, productId: 'sherwani-1', rating: 5, comment: 'Premium quality and fit. Received many compliments at the wedding.' },
    { userId: reviewer2.id, productId: 'dhoti-kurta-1', rating: 4, comment: 'Traditional and comfortable. Perfect for puja ceremonies.' },
    { userId: reviewer1.id, productId: 'nehru-jacket-1', rating: 5, comment: 'Contemporary design with traditional touch. Great for parties and events.' },
    { userId: reviewer3.id, productId: 'nehru-jacket-1', rating: 4, comment: 'Nice embroidery work. Fits perfectly and looks elegant.' },
    { userId: reviewer2.id, productId: 'formal-shirt-1', rating: 5, comment: 'Best formal shirt! Premium cotton and perfect for office wear.' },
    { userId: reviewer1.id, productId: 'formal-trousers-1', rating: 4, comment: 'Good quality fabric and slim fit. Comfortable for all-day wear.' },
    { userId: reviewer3.id, productId: 'mens-leather-jacket-1', rating: 5, comment: 'Premium leather jacket! Looks stylish and feels great.' },
    { userId: reviewer2.id, productId: 'mens-jeans-1', rating: 4, comment: 'Comfortable slim fit jeans. Good quality denim.' },
    
    // Women's Wear Reviews
    { userId: reviewer1.id, productId: 'cotton-saree-1', rating: 5, comment: 'Beautiful floral print! Georgette fabric is soft and comfortable.' },
    { userId: reviewer3.id, productId: 'cotton-saree-1', rating: 4, comment: 'Lovely saree for casual occasions. Good quality at this price.' },
    { userId: reviewer1.id, productId: 'banarasi-saree-1', rating: 5, comment: 'Absolutely stunning Banarasi saree! The golden border is gorgeous.' },
    { userId: reviewer2.id, productId: 'banarasi-saree-1', rating: 5, comment: 'Premium silk quality. Perfect for weddings and special occasions.' },
    { userId: reviewer3.id, productId: 'anarkali-suit-1', rating: 5, comment: 'Elegant anarkali with beautiful embroidery. Received so many compliments!' },
    { userId: reviewer1.id, productId: 'anarkali-suit-1', rating: 4, comment: 'Good quality fabric and nice fitting. Perfect for parties.' },
    { userId: reviewer2.id, productId: 'cotton-kurti-1', rating: 5, comment: 'Very comfortable cotton kurti! Perfect for daily wear.' },
    { userId: reviewer3.id, productId: 'block-print-kurti-1', rating: 4, comment: 'Traditional block print is beautiful. Comfortable and stylish.' },
    { userId: reviewer1.id, productId: 'chanderi-dupatta-1', rating: 5, comment: 'Pure chanderi silk! The golden border adds elegance.' },
    { userId: reviewer2.id, productId: 'palazzo-suit-1', rating: 4, comment: 'Comfortable palazzo set. Great for both casual and formal wear.' },
    { userId: reviewer3.id, productId: 'fusion-jacket-dress-1', rating: 5, comment: 'Love this fusion dress! Perfect blend of Indian and Western styles.' },
    { userId: reviewer1.id, productId: 'indo-western-crop-top-1', rating: 4, comment: 'Stylish crop top set. Great for parties and events.' },
    { userId: reviewer2.id, productId: 'womens-summer-dress-1', rating: 5, comment: 'Light and comfortable summer dress. Floral print is lovely.' },
    { userId: reviewer3.id, productId: 'womens-silk-blouse-1', rating: 4, comment: 'Elegant silk blouse. Perfect for formal occasions.' },
    { userId: reviewer1.id, productId: 'womens-trousers-1', rating: 5, comment: 'Perfect fit! High waist design is flattering and comfortable.' },
    
    // Children's Wear Reviews
    { userId: reviewer2.id, productId: 'boys-kurta-pajama-1', rating: 5, comment: 'My son loves this kurta pajama! Comfortable and looks adorable.' },
    { userId: reviewer3.id, productId: 'boys-kurta-pajama-1', rating: 4, comment: 'Good quality cotton. Perfect for festivals and family functions.' },
    { userId: reviewer1.id, productId: 'boys-bandhgala-1', rating: 5, comment: 'Stylish bandhgala! My son looked like a prince at the wedding.' },
    { userId: reviewer2.id, productId: 'boys-casual-shirt-1', rating: 4, comment: 'Comfortable shirt for daily wear. Good quality fabric.' },
    { userId: reviewer3.id, productId: 'girls-lehenga-1', rating: 5, comment: 'Beautiful pink lehenga! My daughter loves it. Embroidery is stunning.' },
    { userId: reviewer1.id, productId: 'girls-lehenga-1', rating: 5, comment: 'Excellent quality and perfect fit. She looked like a princess!' },
    { userId: reviewer2.id, productId: 'girls-anarkali-1', rating: 4, comment: 'Elegant anarkali dress. Good quality and comfortable for kids.' },
    { userId: reviewer3.id, productId: 'girls-party-dress-1', rating: 5, comment: 'Perfect party dress! My daughter wore it for her birthday.' },
    { userId: reviewer1.id, productId: 'girls-denim-skirt-1', rating: 4, comment: 'Cute denim skirt. Good quality and perfect for casual wear.' },
    { userId: reviewer2.id, productId: 'girls-ghagra-1', rating: 5, comment: 'Traditional ghagra set. Beautiful colors and designs.' },
    { userId: reviewer3.id, productId: 'girls-sharara-1', rating: 4, comment: 'Elegant sharara set. Perfect for festivals and functions.' },
    { userId: reviewer1.id, productId: 'kids-tshirt-1', rating: 5, comment: 'Colorful and comfortable t-shirt! My kid loves the design.' },
    { userId: reviewer2.id, productId: 'kids-denim-jacket-1', rating: 4, comment: 'Stylish denim jacket. Good quality and fits well.' },
    
    // Footwear & Accessories Reviews
    { userId: reviewer3.id, productId: 'men-formal-shoes-1', rating: 5, comment: 'Premium leather shoes! Very comfortable for all-day wear at office.' },
    { userId: reviewer1.id, productId: 'men-ethnic-mojari-1', rating: 4, comment: 'Traditional mojari with great craftsmanship. Perfect for ethnic wear.' },
    { userId: reviewer2.id, productId: 'women-ethnic-sandals-1', rating: 5, comment: 'Comfortable and beautiful sandals! Great for traditional outfits.' },
    { userId: reviewer3.id, productId: 'leather-handbag-1', rating: 5, comment: 'Elegant embroidered handbag. Good quality and spacious.' },
    { userId: reviewer1.id, productId: 'mens-leather-belt-1', rating: 4, comment: 'Good quality leather belt. Sturdy and looks premium.' },
    { userId: reviewer2.id, productId: 'womens-jewelry-set-1', rating: 5, comment: 'Beautiful ethnic jewelry set! Looks expensive but very affordable.' },
    { userId: reviewer3.id, productId: 'men-watch-1', rating: 4, comment: 'Stylish traditional watch. Good quality and keeps accurate time.' },
    { userId: reviewer1.id, productId: 'mens-silk-pocket-square-1', rating: 5, comment: 'Premium silk pocket square. Adds elegance to formal wear.' }
  ]

  for (const review of reviews) {
    await prisma.review.create({
      data: {
        userId: review.userId,
        productId: review.productId,
        rating: review.rating,
        comment: review.comment
      }
    })
  }

  console.log('Added mock reviews and ratings')
  console.log('Database seeded successfully!')
}

export { main }

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
