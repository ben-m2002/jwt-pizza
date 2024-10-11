import { test, expect } from 'playwright-test-coverage';

test('home page', async ({ page }) => {
  await page.goto('/');
  expect(await page.title()).toBe('JWT Pizza');
});

test('purchase with login', async ({ page }) => {
  await page.route('*/**/api/order/menu', async (route) => {
    const menuRes = [
      { id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' },
      { id: 2, title: 'Pepperoni', image: 'pizza2.png', price: 0.0042, description: 'Spicy treat' },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: menuRes });
  });

  await page.route('*/**/api/franchise', async (route) => {
    const franchiseRes = [
      {
        id: 2,
        name: 'LotaPizza',
        stores: [
          { id: 4, name: 'Lehi' },
          { id: 5, name: 'Springville' },
          { id: 6, name: 'American Fork' },
        ],
      },
      { id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
      { id: 4, name: 'topSpot', stores: [] },
    ];
    expect(route.request().method()).toBe('GET');
    await route.fulfill({ json: franchiseRes });
  });

  await page.route('*/**/api/auth', async (route) => {
    const loginReq = { email: 'd@jwt.com', password: 'a' };
    const loginRes = { user: { id: 3, name: 'Kai Chen', email: 'd@jwt.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
  });

  await page.route('*/**/api/order', async (route) => {
    const orderReq = {
      items: [
        { menuId: 1, description: 'Veggie', price: 0.0038 },
        { menuId: 2, description: 'Pepperoni', price: 0.0042 },
      ],
      storeId: '4',
      franchiseId: 2,
    };
    const orderRes = {
      order: {
        items: [
          { menuId: 1, description: 'Veggie', price: 0.0038 },
          { menuId: 2, description: 'Pepperoni', price: 0.0042 },
        ],
        storeId: '4',
        franchiseId: 2,
        id: 23,
      },
      jwt: 'eyJpYXQ',
    };
    expect(route.request().method()).toBe('POST');
    expect(route.request().postDataJSON()).toMatchObject(orderReq);
    await route.fulfill({ json: orderRes });
  });

  await page.goto('http://localhost:5173/');

  // Go to order page
  await page.getByRole('button', { name: 'Order now' }).click();

  // Create order
  await expect(page.locator('h2')).toContainText('Awesome is a click away');
  await page.getByRole('combobox').selectOption('4');
  await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
  await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
  await expect(page.locator('form')).toContainText('Selected pizzas: 2');
  await page.getByRole('button', { name: 'Checkout' }).click();

  // Login
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('d@jwt.com');
  await page.getByPlaceholder('Email address').press('Tab');
  await page.getByPlaceholder('Password').fill('a');
  await page.getByRole('button', { name: 'Login' }).click();

  // Pay
  await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
  await expect(page.locator('tbody')).toContainText('Veggie');
  await expect(page.locator('tbody')).toContainText('Pepperoni');
  await expect(page.locator('tfoot')).toContainText('0.008 ₿');
  await page.getByRole('button', { name: 'Pay now' }).click();

  // Check balance
  await expect(page.getByText('0.008')).toBeVisible();
});


test('register, profile, lougout, login', async ({ page }) => {

  await page.route('*/**/api/auth', async (route) => {
    // logout
    if (route.request().method() === 'DELETE') {
      // Define the expected response for the logout operation
      const logoutRes = {
        message: "logout successful"
      };
  
      // Verify the request method and fulfill it with the appropriate response
      expect(route.request().method()).toBe('DELETE');
      
      // Optionally, check for headers like authorization to ensure this request is valid
      const authHeader = route.request().headers()['authorization'];
      expect(authHeader).toContain('Bearer ');  // Ensure there is a Bearer token
  
      // Fulfill the request with the response
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(logoutRes)
      });
    }
    else if (route.request().method() === 'POST') {
      // Register
      const registerReq = {name : 'Johnny Cash', email : 'johnnycash@gmail.com',
        password : '1234'};
      const registerRes = {"user": {
        "name": "Johnny Cash",
        "email": "johnnycash@gmail.com",
        "roles": [
          {
            "role": "diner"
          }
        ],
        "id": 145
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obm55IENhc2giLCJlbWFpbCI6ImpvaG5ueWNhc2hAZ21haWwuY29tIiwicm9sZXMiOlt7InJvbGUiOiJkaW5lciJ9XSwiaWQiOjE0NSwiaWF0IjoxNzI3ODEyOTIxfQ.3pcbVp8QcvQDIa6JH7pMo47U-wUaldnwM_4_9qB_yIE"
      };
      expect(route.request().method()).toBe('POST');
      expect(route.request().postDataJSON()).toMatchObject(registerReq);
      await route.fulfill({ json: registerRes });
    }
    else{
      // login
      const loginReq = { email: 'johnnycash@gmail.com', password: '1234' };
      const loginRes = { user: { id: 3, name: 'Johnny Cash', email: 'johnnycash@gmail.com', roles: [{ role: 'diner' }] }, token: 'abcdef' };
      expect(route.request().method()).toBe('PUT');
      expect(route.request().postDataJSON()).toMatchObject(loginReq);
      await route.fulfill({ json: loginRes });
    }
  });

    await page.goto('http://localhost:5173/');
    await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
    await expect(page.locator('#navbar-dark')).toContainText('Register');
    await page.getByRole('link', { name: 'Register' }).click();
    await page.getByPlaceholder('Full name').fill('Johnny Cash');
    await page.getByPlaceholder('Email address').click();
    await page.getByPlaceholder('Email address').fill('johnnycash@gmail.com');
    await page.getByPlaceholder('Password').click();
    await page.getByPlaceholder('Password').fill('1234');
    await expect(page.locator('form')).toContainText('Register');
    await page.getByRole('button', { name: 'Register' }).click();
    await page.getByRole('link', { name: 'JC' }).click();
    await expect(page.getByRole('heading')).toContainText('Your pizza kitchen');
    await expect(page.getByRole('main')).toContainText('Johnny Cash');
    await expect(page.getByRole('main')).toContainText('johnnycash@gmail.com');
    await expect(page.getByRole('main')).toContainText('diner');
    await page.getByRole('link', { name: 'Logout' }).click();
    await page.getByRole('link', { name: 'Login' }).click();
    await page.getByPlaceholder('Email address').fill('johnnycash@gmail.com');
    await page.getByPlaceholder('Password').click();
    await page.getByPlaceholder('Password').fill('1234');
    await page.getByRole('button', { name: 'Login' }).click();
});

test("franchise dashboard", async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.getByLabel('Global').getByRole('link', { name: 'Franchise' }).click();
  await page.getByText('So you want a piece of the').click();
  await expect(page.getByRole('main')).toContainText('So you want a piece of the pie?');
  await expect(page.locator('#navbar-dark')).toContainText('Franchise');
  await page.getByRole('link', { name: '-555-5555' }).click();
  await expect(page.getByRole('main')).toContainText('Call now800-555-5555');
  await page.getByText('Now is the time to get in on').click();
  await expect(page.getByRole('main')).toContainText('Now is the time to get in on the JWT Pizza tsunami. The pizza sells itself. People cannot get enough. Setup your shop and let the pizza fly. Here are all the reasons why you should buy a franchise with JWT Pizza.');
  await expect(page.getByRole('main')).toContainText('Owning a franchise with JWT Pizza can be highly profitable. With our proven business model and strong brand recognition, you can expect to generate significant revenue. Our profit forecasts show consistent growth year after year, making it a lucrative investment opportunity.');
  await expect(page.getByRole('main')).toContainText('In addition to financial success, owning a franchise also allows you to make a positive impact on your community. By providing delicious pizzas and creating job opportunities, you contribute to the local economy and bring joy to people\'s lives. It\'s a rewarding experience that combines entrepreneurship with social responsibility. The following table shows a possible stream of income from your franchise.');
  await expect(page.getByRole('main')).toContainText('But it\'s not just about the money. By becoming a franchise owner, you become part of a community that is passionate about delivering exceptional pizzas and creating memorable experiences. You\'ll have the chance to build a team of dedicated employees who share your vision and work together to achieve greatness. And as your business grows, so does your impact on the local economy, creating jobs and bringing joy to countless pizza lovers.');
  await expect(page.getByRole('main')).toContainText('Unleash Your Potential');
  await expect(page.getByRole('main')).toContainText('Are you ready to embark on a journey towards unimaginable wealth? Owning a franchise with JWT Pizza is your ticket to financial success. With our proven business model and strong brand recognition, you have the opportunity to generate substantial revenue. Imagine the thrill of watching your profits soar year after year, as customers flock to your JWT Pizza, craving our mouthwatering creations.');
  await expect(page.locator('tbody')).toContainText('2020');
  await expect(page.locator('tbody')).toContainText('2021');
  await expect(page.locator('tbody')).toContainText('2022');
  await expect(page.locator('tbody')).toContainText('50 ₿');
  await expect(page.locator('tbody')).toContainText('150 ₿');
  await expect(page.locator('tbody')).toContainText('300 ₿');
  await expect(page.locator('tbody')).toContainText('400 ₿');
  await expect(page.locator('tbody')).toContainText('500 ₿');
  await expect(page.locator('tbody')).toContainText('600 ₿');
  await expect(page.locator('tbody')).toContainText('50 ₿');
  await expect(page.locator('tbody')).toContainText('50 ₿');
  await expect(page.locator('tbody')).toContainText('50 ₿');
  await expect(page.locator('thead')).toContainText('Year');
  await expect(page.locator('thead')).toContainText('Profit');
  await expect(page.locator('thead')).toContainText('Costs');
  await expect(page.locator('thead')).toContainText('Franchise Fee');
  await page.getByRole('main').locator('img').click();
  await expect(page.getByRole('main').locator('img')).toBeVisible();
});

test("about page and history page", async ({ page }) => {
 await page.goto('http://localhost:5173/');
 await expect(page.getByRole('contentinfo')).toContainText('About');
 await expect(page.getByRole('contentinfo')).toContainText('History');
 await page.getByRole('link', { name: 'About' }).click();
 await expect(page.getByRole('main')).toContainText('The secret sauce');
 await expect(page.getByRole('main')).toContainText('At JWT Pizza, our amazing employees are the secret behind our delicious pizzas. They are passionate about their craft and spend every waking moment dreaming about how to make our pizzas even better. From selecting the finest ingredients to perfecting the dough and sauce recipes, our employees go above and beyond to ensure the highest quality and taste in every bite. Their dedication and attention to detail make all the difference in creating a truly exceptional pizza experience for our customers. We take pride in our team and their commitment to delivering the best pizza in town.');
 await expect(page.getByRole('main')).toContainText('Our talented employees at JWT Pizza are true artisans. They pour their heart and soul into every pizza they create, striving for perfection in every aspect. From hand-stretching the dough to carefully layering the toppings, they take pride in their work and are constantly seeking ways to elevate the pizza-making process. Their creativity and expertise shine through in every slice, resulting in a pizza that is not only delicious but also a work of art. We are grateful for our dedicated team and their unwavering commitment to delivering the most flavorful and satisfying pizzas to our valued customers.');
 await expect(page.getByRole('main')).toContainText('Our employees');
 await expect(page.getByRole('main')).toContainText('JWT Pizza is home to a team of pizza enthusiasts who are truly passionate about their craft. They are constantly experimenting with new flavors, techniques, and ingredients to push the boundaries of traditional pizza-making. Their relentless pursuit of perfection is evident in every bite, as they strive to create a pizza experience that is unparalleled. Our employees understand that the secret to a great pizza lies in the details, and they leave no stone unturned in their quest for pizza perfection. We are proud to have such dedicated individuals on our team, as they are the driving force behind our reputation for exceptional quality and taste.');
 await page.locator('div').filter({ hasText: /^James$/ }).getByRole('img').click();
 await expect(page.locator('div').filter({ hasText: /^James$/ }).getByRole('img')).toBeVisible();
 await expect(page.locator('div').filter({ hasText: /^Maria$/ }).getByRole('img')).toBeVisible();
 await page.locator('div').filter({ hasText: /^Anna$/ }).getByRole('img').click();
 await expect(page.locator('div').filter({ hasText: /^Brian$/ }).getByRole('img')).toBeVisible();
 await expect(page.getByRole('main')).toContainText('At JWT Pizza, our employees are more than just pizza makers. They are culinary artists who are deeply passionate about their craft. They approach each pizza with creativity, precision, and a genuine love for what they do. From experimenting with unique flavor combinations to perfecting the cooking process, our employees are constantly pushing the boundaries of what a pizza can be. Their dedication and expertise result in pizzas that are not only delicious but also a reflection of their passion and commitment. We are grateful for our talented team and the incredible pizzas they create day in and day out.');
 await page.getByRole('link', { name: 'History' }).click();
 await expect(page.getByRole('heading')).toContainText('Mama Rucci, my my');
 await expect(page.getByRole('main')).toContainText('It all started in Mama Ricci\'s kitchen. She would delight all of the cousins with a hot pie in any style they could think of Milanese, Chicago deep dish, Detroit square pan, Neapolitan, or even fusion flatbread.Pizza has a long and rich history that dates back thousands of years. Its origins can be traced back to ancient civilizations such as the Egyptians, Greeks, and Romans. The ancient Egyptians were known to bake flatbreads topped with various ingredients, similar to modern-day pizza. In ancient Greece, they had a dish called "plakous" which consisted of flatbread topped with olive oil, herbs, and cheese.However, it was the Romans who truly popularized pizza-like dishes. They would top their flatbreads with various ingredients such as cheese, honey, and bay leaves.Fast forward to the 18th century in Naples, Italy, where the modern pizza as we know it today was born. Neapolitan pizza was typically topped with tomatoes, mozzarella cheese, and basil. It quickly became a favorite among the working class due to its affordability and delicious taste. In the late 19th century, pizza made its way to the United States through Italian immigrants.It gained popularity in cities like New York and Chicago, where pizzerias started popping up. Today, pizza is enjoyed worldwide and comes in countless variations and flavors. However, the classic Neapolitan pizza is still a favorite among many pizza enthusiasts. This is especially true if it comes from JWT Pizza!');
 await page.getByRole('contentinfo').click();
});

test("admin dashboard", async ({ page }) => {
  await page.route('*/**/api/auth', async (route) => {
    // Register
    if (route.request().method() === 'POST') {
        const registerReq = {
          "name": "BenjiBoo",
          "email": "benji@jwt.com",
          "password": "1234"
        }
        const registerRes = {
          "user": {
            "name": "BenjiBoo",
            "email": "benji@jwt.com",
            "roles": [
              {
                "role": "diner"
              }
            ],
            "id": 14
          },
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiQmVuamlCb28iLCJlbWFpbCI6ImJlbmppQGp3dC5jb20iLCJyb2xlcyI6W3sicm9sZSI6ImRpbmVyIn1dLCJpZCI6MTQsImlhdCI6MTcyNzkxMDIxMX0.G4l8jiPbOs7ua9YmBcH6wJOE40b33fz9_EiUIMli1I0"
        }
        expect(route.request().method()).toBe('POST');
        expect(route.request().postDataJSON()).toMatchObject(registerReq);
        await route.fulfill({ json: registerRes });
      }
      else if (route.request().method() === 'PUT') {
        // login
        const loginReq = {
          "email": "a@jwt.com",
          "password": "admin"
        }
        const loginRes = {
          "user": {
            "id": 1,
            "name": "常用名字",
            "email": "a@jwt.com",
            "roles": [
              {
                "role": "admin"
              }
            ]
          },
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IuW4uOeUqOWQjeWtlyIsImVtYWlsIjoiYUBqd3QuY29tIiwicm9sZXMiOlt7InJvbGUiOiJhZG1pbiJ9XSwiaWF0IjoxNzI3OTEwMjExfQ.wvzKRtEzlglLfrWkt8cI0Bn4JwyDFhOfkVEa6Fj8mD0"
        }
        expect(route.request().method()).toBe('PUT');
        expect(route.request().postDataJSON()).toMatchObject(loginReq);
        await route.fulfill({ json: loginRes });
      }
      else {
        // logout
        const logoutRes = {
          "message": "logout successful"
        }
        expect(route.request().method()).toBe('DELETE');
        await route.fulfill({ json: logoutRes });
      }
  });

  await page.route('*/**/api/franchise', async (route) => {
    if (route.request().method() === 'POST') {
      const request = route.request();
      const headers = request.headers();
      const authorizationHeader = headers['authorization'];
      expect(authorizationHeader).toBeTruthy(); 
      expect(authorizationHeader).toMatch(/^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/); // Regex to match Bearer token structure
      const franchiseReq = {
        "stores": [],
        "name": "ThisFranchise3",
        "admins": [
          {
            "email": "benji@jwt.com"
          }
        ]
      }
      const franchiseRes = {
        "stores": [],
        "name": "ThisFranchise3",
        "admins": [
          {
            "email": "benji@jwt.com",
            "id": 3,
            "name": "BenjiBoo"
          }
        ],
        "id": 24
      }
      expect(route.request().method()).toBe('POST');
      expect(route.request().postDataJSON()).toMatchObject(franchiseReq);
      await route.fulfill({ json: franchiseRes });
    }
  });


  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Register' }).click();
  await page.getByPlaceholder('Full name').click();
  await page.getByPlaceholder('Full name').fill('BenjiBoo');
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('benji@jwt.com');
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill('1234');
  await expect(page.locator('form')).toContainText('Register');
  await page.getByRole('button', { name: 'Register' }).click();
  await page.getByRole('link', { name: 'Logout' }).click();
  await expect(page.locator('#navbar-dark')).toContainText('Login');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').fill('a@jwt.com');
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill('admin');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Admin' }).click();
  await expect(page.getByRole('heading')).toContainText('Mama Ricci\'s kitchen');
  await page.getByText('Keep the dough rolling and').click();
  await expect(page.getByRole('main')).toContainText('Keep the dough rolling and the franchises signing up.');
  await page.getByRole('button', { name: 'Add Franchise' }).click();
  await page.getByPlaceholder('franchise name').click();
  await page.getByPlaceholder('franchise name').fill('ThisFranchise3');
  await page.getByPlaceholder('franchisee admin email').click();
  await page.getByPlaceholder('franchisee admin email').fill('benji@jwt.com');
  await expect(page.getByRole('heading')).toContainText('Create franchise');
  await page.getByText('homeadmin-dashboardcreate-').click();
  await page.locator('div').filter({ hasText: /^Want to create franchise\?CreateCancel$/ }).click();
  await page.locator('div').filter({ hasText: 'Create franchiseWant to' }).nth(2).click();
  await page.locator('#root').click();
  await expect(page.locator('form')).toContainText('Create');
  await expect(page.locator('form')).toContainText('Cancel');
  await page.getByRole('button', { name: 'Create' }).click();
  await page.getByText('OrderAdminLogout').click();
  await page.getByText('homeadmin-dashboard').click();
});

test("admin delete franchise and logout", async ({ page }) => {
  await page.route('*/**/api/auth', async (route) => {
    if (route.request().method() === 'PUT') {
        // login
        const loginReq = {
          "email": "a@jwt.com",
          "password": "admin"
        }
        const loginRes = {
          "user": {
            "id": 1,
            "name": "常用名字",
            "email": "a@jwt.com",
            "roles": [
              {
                "role": "admin"
              }
            ]
          },
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IuW4uOeUqOWQjeWtlyIsImVtYWlsIjoiYUBqd3QuY29tIiwicm9sZXMiOlt7InJvbGUiOiJhZG1pbiJ9XSwiaWF0IjoxNzI3OTEwMjExfQ.wvzKRtEzlglLfrWkt8cI0Bn4JwyDFhOfkVEa6Fj8mD0"
        }
        expect(route.request().method()).toBe('PUT');
        expect(route.request().postDataJSON()).toMatchObject(loginReq);
        await route.fulfill({ json: loginRes });
      }
      else {
        // logout
        const logoutRes = {
          "message": "logout successful"
        }
        expect(route.request().method()).toBe('DELETE');
        await route.fulfill({ json: logoutRes });
      }
  });

  await page.route('*/**/api/franchise', async (route) => {
    if (route.request().method() === 'GET') {
      const request = route.request();
      const headers = request.headers();
      const authorizationHeader = headers['authorization'];
      expect(authorizationHeader).toBeTruthy(); 
      expect(authorizationHeader).toMatch(/^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/);
      const franchiseRes =  [
        {
          id: 2,
          name: "ThisFranchise3",
          admins: [{ id: 4, name: "BenjiBoo", email: "benji@jwt.com" }],
          stores: [],
        }
      ]
      expect(route.request().method()).toBe('GET');
      await route.fulfill({ json: franchiseRes });
    }
    else if(route.request().method() === 'DELETE') {
      const request = route.request();
      const headers = request.headers();
      const authorizationHeader = headers['authorization'];
      expect(authorizationHeader).toBeTruthy(); 
      expect(authorizationHeader).toMatch(/^Bearer\s[\w-]+\.[\w-]+\.[\w-]+$/);
      const franchiseRes = {
        message: "franchise deleted"
      }
      expect(route.request().method()).toBe('DELETE');
      await route.fulfill({ json: franchiseRes });
    }
  });

  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('a@jwt.com');
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill('admin');
  await page.getByPlaceholder('Password').press('Enter');
  await page.getByRole('link', { name: 'Admin' }).click();
  await page.getByRole('row', { name: 'ThisFranchise3 BenjiBoo Close' }).getByRole('button').click();
  await page.getByText('Sorry to see you go').click();
  await expect(page.getByRole('heading')).toContainText('Sorry to see you go');
  await expect(page.getByRole('main')).toContainText('Are you sure you want to close the ThisFranchise3 franchise? This will close all associated stores and cannot be restored. All outstanding revenue with not be refunded.');
  await expect(page.getByRole('main')).toContainText('Cancel');
  await expect(page.getByRole('main')).toContainText('Close');
  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByRole('link', { name: 'Logout' }).click();
});

test("not found", async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.goto('http://localhost:5173/o');
  await expect(page.getByRole('heading')).toContainText('Oops');
  await expect(page.getByRole('main')).toContainText('It looks like we have dropped a pizza on the floor. Please try another page.');
  await expect(page.getByRole('main')).toContainText('OopsIt looks like we have dropped a pizza on the floor. Please try another page.');
  await expect(page.getByRole('list')).toContainText('homeo');
  await expect(page.getByRole('list')).toContainText('o');
  await expect(page.getByRole('list')).toContainText('home');
});

test("docs page", async({page}) => {
  await page.goto('http://localhost:5173/');
  await page.goto('http://localhost:5173/docs');
  await expect(page.getByRole('main')).toContainText('JWT Pizza API');
  await page.getByLabel('Global').click();
  await page.getByText('homedocs').click();
  await expect(page.getByRole('main')).toContainText('[POST] /api/auth');
  await expect(page.getByRole('main')).toContainText('Register a new user');
  await expect(page.getByRole('main')).toContainText('Example requestcurl -X POST localhost:3000/api/auth -d \'{"name":"pizza diner", "email":"d@jwt.com", "password":"diner"}\' -H \'Content-Type: application/json\'');
  await expect(page.getByRole('main')).toContainText('{ "user": { "id": 2, "name": "pizza diner", "email": "d@jwt.com", "roles": [ { "role": "diner" } ] }, "token": "tttttt" }');
  await expect(page.getByRole('main')).toContainText('Response');
  await expect(page.getByRole('main')).toContainText('[PUT] /api/auth');
  await expect(page.getByRole('main')).toContainText('Login existing user');
  await expect(page.getByRole('main')).toContainText('Example requestcurl -X PUT localhost:3000/api/auth -d \'{"email":"a@jwt.com", "password":"admin"}\' -H \'Content-Type: application/json\'');
  await expect(page.getByRole('main')).toContainText('Response{ "user": { "id": 1, "name": "常用名字", "email": "a@jwt.com", "roles": [ { "role": "admin" } ] }, "token": "tttttt" }');
  await expect(page.getByRole('main')).toContainText('🔐 [PUT] /api/auth/:userId');
  await expect(page.getByRole('main')).toContainText('Update user');
  await expect(page.getByRole('main')).toContainText('Example requestcurl -X PUT localhost:3000/api/auth/1 -d \'{"email":"a@jwt.com", "password":"admin"}\' -H \'Content-Type: application/json\' -H \'Authorization: Bearer tttttt\'');
  await expect(page.getByRole('main')).toContainText('Response{ "id": 1, "name": "常用名字", "email": "a@jwt.com", "roles": [ { "role": "admin" } ] }');
  await expect(page.getByRole('main')).toContainText('🔐 [DELETE] /api/auth');
  await expect(page.getByRole('main')).toContainText('🔐 [DELETE] /api/authLogout a userExample requestcurl -X DELETE localhost:3000/api/auth -H \'Authorization: Bearer tttttt\'Response{ "message": "logout successful" }');
  await expect(page.getByRole('main')).toContainText('[GET] /api/order/menuGet the pizza menuExample requestcurl localhost:3000/api/order/menuResponse[ { "id": 1, "title": "Veggie", "image": "pizza1.png", "price": 0.0038, "description": "A garden of delight" } ]');
  await expect(page.getByRole('main')).toContainText('🔐 [PUT] /api/order/menu');
  await expect(page.getByRole('main')).toContainText('Add an item to the menu');
  await expect(page.getByRole('main')).toContainText('Example requestcurl -X PUT localhost:3000/api/order/menu -H \'Content-Type: application/json\' -d \'{ "title":"Student", "description": "No topping, no sauce, just carbs", "image":"pizza9.png", "price": 0.0001 }\' -H \'Authorization: Bearer tttttt\'');
  await expect(page.getByRole('main')).toContainText('🔐 [GET] /api/order');
  await expect(page.getByRole('main')).toContainText('Get the orders for the authenticated user');
  await expect(page.getByRole('main')).toContainText('Example requestcurl -X GET localhost:3000/api/order -H \'Authorization: Bearer tttttt\'');
  await expect(page.getByRole('main')).toContainText('Response{ "dinerId": 4, "orders": [ { "id": 1, "franchiseId": 1, "storeId": 1, "date": "2024-06-05T05:14:40.000Z", "items": [ { "id": 1, "menuId": 1, "description": "Veggie", "price": 0.05 } ] } ], "page": 1 }');
  await expect(page.getByRole('main')).toContainText('🔐 [POST] /api/order');
  await expect(page.getByRole('main')).toContainText('Create a order for the authenticated user');
  await expect(page.getByRole('main')).toContainText('Example requestcurl -X POST localhost:3000/api/order -H \'Content-Type: application/json\' -d \'{"franchiseId": 1, "storeId":1, "items":[{ "menuId": 1, "description": "Veggie", "price": 0.05 }]}\' -H \'Authorization: Bearer tttttt\'');
  await expect(page.getByRole('main')).toContainText('Response{ "order": { "franchiseId": 1, "storeId": 1, "items": [ { "menuId": 1, "description": "Veggie", "price": 0.05 } ], "id": 1 }, "jwt": "1111111111" }');
  await expect(page.getByRole('main')).toContainText('[GET] /api/franchise');
  await expect(page.getByRole('main')).toContainText('List all the franchises');
  await expect(page.getByRole('main')).toContainText('Example requestcurl localhost:3000/api/franchise');
  await expect(page.getByRole('main')).toContainText('Response[ { "id": 1, "name": "pizzaPocket", "stores": [ { "id": 1, "name": "SLC" } ] } ]');
  await expect(page.getByRole('main')).toContainText('🔐 [GET] /api/franchise/:userId');
  await expect(page.getByRole('main')).toContainText('List a user\'s franchises');
  await expect(page.getByRole('main')).toContainText('Example requestcurl localhost:3000/api/franchise/4 -H \'Authorization: Bearer tttttt\'');
  await expect(page.getByRole('main')).toContainText('Response[ { "id": 2, "name": "pizzaPocket", "admins": [ { "id": 4, "name": "pizza franchisee", "email": "f@jwt.com" } ], "stores": [ { "id": 4, "name": "SLC", "totalRevenue": 0 } ] } ]');
  await expect(page.getByRole('main')).toContainText('🔐 [POST] /api/franchise');
  await expect(page.getByRole('main')).toContainText('Create a new franchise');
  await expect(page.getByRole('main')).toContainText('Example requestcurl -X POST localhost:3000/api/franchise -H \'Content-Type: application/json\' -H \'Authorization: Bearer tttttt\' -d \'{"name": "pizzaPocket", "admins": [{"email": "f@jwt.com"}]}\'');
  await expect(page.getByRole('main')).toContainText('Response{ "name": "pizzaPocket", "admins": [ { "email": "f@jwt.com", "id": 4, "name": "pizza franchisee" } ], "id": 1 }');
  await expect(page.getByRole('main')).toContainText('🔐 [DELETE] /api/franchise/:franchiseId');
  await expect(page.getByRole('main')).toContainText('Delete a franchises');
  await expect(page.getByRole('main')).toContainText('Example requestcurl -X DELETE localhost:3000/api/franchise/1 -H \'Authorization: Bearer tttttt\'');
  await expect(page.getByRole('main')).toContainText('Response{ "message": "franchise deleted" }');
  await expect(page.getByRole('main')).toContainText('🔐 [POST] /api/franchise/:franchiseId/store');
  await expect(page.getByRole('main')).toContainText('Create a new franchise store');
  await expect(page.getByRole('main')).toContainText('Example requestcurl -X POST localhost:3000/api/franchise/1/store -H \'Content-Type: application/json\' -d \'{"franchiseId": 1, "name":"SLC"}\' -H \'Authorization: Bearer tttttt\'');
  await expect(page.getByRole('main')).toContainText('Response{ "id": 1, "franchiseId": 1, "name": "SLC" }');
  await expect(page.getByRole('main')).toContainText('🔐 [DELETE] /api/franchise/:franchiseId/store/:storeId');
  await expect(page.getByRole('main')).toContainText('Delete a store');
  await expect(page.getByRole('main')).toContainText('Example requestcurl -X DELETE localhost:3000/api/franchise/1/store/1 -H \'Authorization: Bearer tttttt\'');
  await expect(page.getByRole('main')).toContainText('Response{ "message": "store deleted" }');
  await expect(page.getByText('[POST] /api/authRegister a')).toBeVisible();
  await expect(page.getByText('[PUT] /api/authLogin existing')).toBeVisible();
  await page.getByText('🔐 [PUT] /api/auth/:userIdUpdate userExample requestcurl -X PUT localhost:3000/').click();
  await expect(page.getByText('🔐 [DELETE] /api/authLogout a')).toBeVisible();
  await expect(page.getByText('[GET] /api/order/menuGet the')).toBeVisible();
  await expect(page.getByText('🔐 [PUT] /api/order/menuAdd')).toBeVisible();
  await page.getByText('🔐 [GET] /api/orderGet the').click();
  await expect(page.getByText('🔐 [GET] /api/orderGet the')).toBeVisible();
  await expect(page.getByText('🔐 [POST] /api/orderCreate a')).toBeVisible();
  await expect(page.getByText('[GET] /api/franchiseList all')).toBeVisible();
  await expect(page.getByText('🔐 [GET] /api/franchise/:userIdList a user\'s franchisesExample requestcurl')).toBeVisible();
  await expect(page.getByText('🔐 [POST] /api/franchiseCreate a new franchiseExample requestcurl -X POST')).toBeVisible();
  await expect(page.getByText('🔐 [DELETE] /api/franchise/:franchiseIdDelete a franchisesExample requestcurl -')).toBeVisible();
  await expect(page.getByRole('heading', { name: '🔐 [POST] /api/franchise/:' })).toBeVisible();
  await page.getByText('🔐 [POST] /api/franchise/:franchiseId/storeCreate a new franchise storeExample').click();
  await expect(page.getByText('🔐 [DELETE] /api/franchise/:franchiseId/store/:storeIdDelete a storeExample')).toBeVisible();
});

test("create store",  async({page}) => {
   await page.route('*/**/api/auth', async (route) => {
        // login
        const loginReq = {
          "email": "a@jwt.com",
          "password": "admin"
        }
        const loginRes = {
          "user": {
            "id": 1,
            "name": "常用名字",
            "email": "a@jwt.com",
            "roles": [
              {
                "role": "admin"
              }
            ]
          },
          "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IuW4uOeUqOWQjeWtlyIsImVtYWlsIjoiYUBqd3QuY29tIiwicm9sZXMiOlt7InJvbGUiOiJhZG1pbiJ9XSwiaWF0IjoxNzI3OTEwMjExfQ.wvzKRtEzlglLfrWkt8cI0Bn4JwyDFhOfkVEa6Fj8mD0"
        }
        expect(route.request().method()).toBe('PUT');
        expect(route.request().postDataJSON()).toMatchObject(loginReq);
        await route.fulfill({ json: loginRes });
    });

 await page.goto('http://localhost:5173/');
 await page.getByRole('link', { name: 'Login' }).click();
 await page.getByPlaceholder('Email address').fill('a@jwt.com');
 await page.getByPlaceholder('Password').click();
 await page.getByPlaceholder('Password').fill('admin');
 await page.getByPlaceholder('Password').press('Enter');
 await page.goto('http://localhost:5173/create-store');
 await page.getByPlaceholder('store name').click();
 await page.getByPlaceholder('store name').fill('');
 await expect(page.getByRole('heading')).toContainText('Create store');
 await expect(page.getByRole('main')).toContainText('CreateCancel');
 await expect(page.locator('form')).toContainText('Create');
 await expect(page.locator('form')).toContainText('Cancel');
 await page.getByPlaceholder('store name').click();
 await page.getByPlaceholder('store name').fill('MyStore');
})

test("create store, close store",  async({page}) => {
  await page.route('*/**/api/auth', async (route) => {
    // login
    const loginReq = {
      "email": "a@jwt.com",
      "password": "admin"
    }
    const loginRes = {
      "user": {
        "id": 1,
        "name": "常用名字",
        "email": "a@jwt.com",
        "roles": [
          {
            "role": "admin"
          }
        ]
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IuW4uOeUqOWQjeWtlyIsImVtYWlsIjoiYUBqd3QuY29tIiwicm9sZXMiOlt7InJvbGUiOiJhZG1pbiJ9XSwiaWF0IjoxNzI3OTEwMjExfQ.wvzKRtEzlglLfrWkt8cI0Bn4JwyDFhOfkVEa6Fj8mD0"
    }
    expect(route.request().method()).toBe('PUT');
    expect(route.request().postDataJSON()).toMatchObject(loginReq);
    await route.fulfill({ json: loginRes });
});
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByPlaceholder('Email address').click();
  await page.getByPlaceholder('Email address').fill('a@jwt.com');
  await page.getByPlaceholder('Password').click();
  await page.getByPlaceholder('Password').fill('admin');
  await page.getByPlaceholder('Password').press('Enter');
  await page.locator('#root').click();
  await page.goto('http://localhost:5173/create-store');
  await page.getByPlaceholder('store name').click();
  await page.getByPlaceholder('store name').fill('This Store');
  await page.getByRole('button', { name: 'Create' }).click();
  await page.goto('http://localhost:5173/close-store');
  await page.locator('#root').click();
});