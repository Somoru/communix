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
      expect(res.body).toHaveProperty('user');
      expect(res.body).toHaveProperty('token');
    });

    it('should fail to sign up with missing fields', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send({
          // Missing required fields
          name: 'Test User',
          password: 'TestPassword1!',
          profession: 'student'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors'); 
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

    it('should fail to sign up with a weak password', async () => {
      const res = await request(app)
        .post('/auth/signup')
        .send({
          name: 'Test User',
          email: 'testuser2@example.com',
          password: 'weak', // Weak password
          profession: 'student',
          onboardingAnswers: []
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('errors'); 
    });

    it('should fail to log in with invalid credentials', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'wrongpassword' // Incorrect password
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Invalid credentials');
    });
  });

  describe('User Management', () => {
    it('should get user profile (authenticated)', async () => {
      const res = await request(app)
        .get(`/users/${userId}`) 
        .set('Authorization', `Bearer ${jwtToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('userId', userId);
    });

    it('should update user profile (authenticated)', async () => {
      const res = await request(app)
        .put(`/users/${userId}`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          name: 'Updated Name'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('name', 'Updated Name');
    });

    it('should change password (authenticated)', async () => {
      const res = await request(app)
        .post(`/users/${userId}/change-password`)
        .set('Authorization', `Bearer ${jwtToken}`)
        .send({
          currentPassword: 'TestPassword1!',
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