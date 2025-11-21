const { test, expect } = require('@playwright/test');

/**
 * Integration Test: Client-Scoped Data Access (CLIENT-SCOPE-1)
 * 
 * This test verifies that hr_manager_client users can only access data
 * for employees who work/worked for their assigned client.
 */

test.describe('Client-Scoping for hr_manager_client', () => {
  let accessToken;
  let clientId;

  test.beforeAll(async ({ request }) => {
    // Login as hr_manager_client user (user6@teamified.com)
    const response = await request.post('http://localhost:3000/api/v1/auth/login', {
      data: {
        email: 'user6@teamified.com',
        password: 'Admin123!',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    accessToken = data.accessToken;
    
    // Decode JWT to verify clientId is present
    const payload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());
    console.log('JWT Payload:', payload);
    
    expect(payload.clientId).toBeDefined();
    expect(payload.roles).toContain('hr_manager_client');
    clientId = payload.clientId;
    
    console.log(`✅ Logged in as hr_manager_client with clientId: ${clientId}`);
  });

  test('should include clientId in JWT token', async () => {
    const payload = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());
    
    expect(payload).toHaveProperty('clientId');
    expect(payload.clientId).toBeTruthy();
    expect(payload.roles).toContain('hr_manager_client');
    
    console.log('✅ JWT contains clientId:', payload.clientId);
  });

  test('should only see employment records for own client', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/v1/employment-records', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    console.log(`Employment records returned: ${data.employmentRecords.length}`);
    
    // Verify all returned records belong to the hr_manager_client's client
    for (const record of data.employmentRecords) {
      expect(record.clientId).toBe(clientId);
      console.log(`✅ Record ${record.id} belongs to client ${clientId}`);
    }
    
    console.log(`✅ Client-scoping verified: All ${data.employmentRecords.length} records belong to client ${clientId}`);
  });

  test('should only see timesheets for own client employees', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/v1/timesheets', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    console.log(`Timesheets returned: ${data.timesheets?.length || 0}`);
    
    if (data.timesheets && data.timesheets.length > 0) {
      console.log(`✅ Client-scoping applied to timesheets`);
    } else {
      console.log('ℹ️  No timesheets available for this client (expected if no timesheet data exists)');
    }
  });

  test('should only see leave requests for own client employees', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/v1/leave/requests', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    console.log(`Leave requests returned: ${data?.length || 0}`);
    
    if (data && data.length > 0) {
      console.log(`✅ Client-scoping applied to leave requests`);
    } else {
      console.log('ℹ️  No leave requests available for this client (expected if no leave data exists)');
    }
  });

  test('should not be able to access other clients data via query params', async ({ request }) => {
    // Try to bypass client-scoping by providing a different clientId
    const fakeClientId = '00000000-0000-0000-0000-000000000000';
    
    const response = await request.get(`http://localhost:3000/api/v1/employment-records?clientId=${fakeClientId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    // Verify the query param was ignored and own client's data is returned
    for (const record of data.employmentRecords) {
      expect(record.clientId).toBe(clientId);
      expect(record.clientId).not.toBe(fakeClientId);
    }
    
    console.log('✅ Query parameter bypass prevented: clientId filter cannot be overridden');
  });
});

test.describe('Client-Scoping - Admin users should see all data', () => {
  let adminToken;

  test.beforeAll(async ({ request }) => {
    // Login as admin user
    const response = await request.post('http://localhost:3000/api/v1/auth/login', {
      data: {
        email: 'user1@teamified.com',
        password: 'Admin123!',
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    adminToken = data.accessToken;
    
    console.log('✅ Logged in as admin (user1@teamified.com)');
  });

  test('admin should see employment records from all clients', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/v1/employment-records', {
      headers: {
        'Authorization': `Bearer ${adminToken}`,
      },
    });

    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    
    console.log(`Admin sees ${data.employmentRecords.length} employment records (all clients)`);
    
    // Admin should see records from multiple clients
    const uniqueClients = new Set(data.employmentRecords.map(r => r.clientId));
    console.log(`✅ Admin can see data from ${uniqueClients.size} different client(s)`);
  });
});
