const request = require('supertest');
const app = require('../../index'); 

describe('API Endpoints', () => {
  let jwtToken; 
  let userId; // To store the userId for later use

  describe('Authentication', () => {
    it('should sign up a new user', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send({
          name: 'Test User',
          email: 'testuser@example.com',
          password: 'TestPassword1!',
          profession: 'student',
          onboardingAnswers: [
            {
              "question": "What are your interests?",
              "answers": ["technology", "design"]
            }
          ]
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
      jwtToken = res.body.token; 
      userId = res.body.user.userId; // Capture the userId
    });

    it('should log in a user', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'TestPassword1!'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      jwtToken = res.body.token; // Capture the token for later use
    });

    it('should fail to sign up with invalid email format', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send({
          name: 'Test User',
          email: 'invalidemail', // Invalid email
          password: 'TestPassword1!',
          profession: 'student',
          onboardingAnswers: []
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should fail to sign up with duplicate email', async () => {
      // First, sign up with a valid email
      await request(app)
        .post('/auth/signup')
        .send({
          name: 'Test User',
          email: 'testuser@example.com',
          password: 'TestPassword1!',
          profession: 'student',
          onboardingAnswers: []
        });

      // Then, attempt to sign up with the same email
      const res = await request(app)
        .post('/auth/signup')
        .send({
          name: 'Test User',
          email: 'testuser@example.com', // Duplicate email
          password: 'TestPassword1!',
          profession: 'student',
          onboardingAnswers: []
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Email already in use');
    });

    it('should change password (authenticated)', async () => {
      const res = await request(app)
        .post('/auth/change-password')
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          oldPassword: 'TestPassword1!',
          newPassword: 'NewTestPassword1!'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Password changed successfully');
    });

    it('should deactivate account (authenticated)', async () => {
      const res = await request(app)
        .delete(`/users/${userId}`)
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Account deactivated');
    });

    // ... (add more tests for invalid data, unauthenticated requests, etc.) ...
  });

  // ... (add tests for Community Management and Group Chat Management) ...
});