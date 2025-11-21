const argon2 = require('argon2');

async function generateHash() {
  try {
    const password = process.argv[2] || 'Test123!';
    const hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB
      timeCost: 3,
      parallelism: 1,
    });
    
    console.log('Password:', password);
    console.log('Hash:', hash);
    
    // Test verification
    const isValid = await argon2.verify(hash, password);
    console.log('Verification test:', isValid);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

generateHash();
