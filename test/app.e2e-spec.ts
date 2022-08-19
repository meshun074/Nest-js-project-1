import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as pactum from 'pactum';
import { AppModule } from './../src/app.module';
import { PrismaService } from './../src/prisma/prisma.service';
import { AuthDto } from 'src/auth/dto';
import { EdituserDto } from 'src/user/dto';
import { CreateBookmarkDto, EditBookmarkDto } from 'src/bookmark/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb;
    pactum.request.setBaseUrl('http://localhost:3333');
  });

  afterAll(() => {
    app.close();
  });
  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'mikesh22@yahoo.com',
      password: 'password',
      firstname: 'mikah',
      lastname: 'eshun',
    };
    describe('Signup', () => {
      it('Should throw an error if only password is provided', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('Should throw an error if only email is provided', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('Should throw an error if no body', async () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
      it('Should sign up', async () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });
    describe('Signin', () => {
      it('Should sign in', async () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
      it('Should throw an error if only password is provided', async () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });
      it('Should throw an error if only email is provided', async () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });
      it('Should throw an error if no body', async () => {
        return pactum.spec().post('/auth/signin').expectStatus(400);
      });
    });
  });
  describe('User', () => {
    describe('Get_me', () => {
      it('Should get current user', async () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .inspect();
      });
    });
    describe('Edit_user', () => {
      it('Should edit current user', async () => {
        const dto: EdituserDto = {
          //firstname: 'masah',
          // email: 'mikehesdfdh@yahoo.com',
        };
        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200);
      });
    });
  });
  // describe('Bookmarks', () => {
  //   describe('get empty bookmark', () => {
  //     it('Should get empty bookmarks', async () => {
  //       return pactum
  //         .spec()
  //         .get('/bookmarks')
  //         .withHeaders({
  //           Authorization: 'Bearer $S{userAt}',
  //         })
  //         .expectStatus(200)
  //         .inspect();
  //     });
  //   });
  //   describe('Create', () => {
  //     const dto: CreateBookmarkDto = {
  //       title: 'First Bookmark',
  //       link: 'https://masak.com',
  //       description: 'first bookmark',
  //     };
  //     it('Should create bookmark', async () => {
  //       return pactum
  //         .spec()
  //         .post('/bookmarks')
  //         .withHeaders({
  //           Authorization: 'Bearer $S{userAt}',
  //         })
  //         .withBody(dto)
  //         .expectStatus(201)
  //         .inspect()
  //         .stores('bookmarkId', 'id');
  //     });
  //   });
  //   describe('Get_Bookmarks', () => {
  //     it('Should get all bookmarks', async () => {
  //       return pactum
  //         .spec()
  //         .get('/bookmarks')
  //         .withHeaders({
  //           Authorization: 'Bearer $S{userAt}',
  //         })
  //         .expectStatus(200)
  //         .inspect();
  //     });
  //   });
  //   describe('Get_id', () => {
  //     it('Should get bookmarks', async () => {
  //       return pactum
  //         .spec()
  //         .get('/bookmarks/{id}')
  //         .withPathParams('id', '$S{bookmarkId}')
  //         .withHeaders({
  //           Authorization: 'Bearer $S{userAt}',
  //         })
  //         .expectStatus(200)
  //         .inspect();
  //     });
  //   });
  //   describe('Edit', () => {
  //     it('Should edit bookmarks by id', async () => {
  //       const dto: EditBookmarkDto = {
  //         title: 'my bookmark',
  //         description: 'This is my bookmark',
  //       };
  //       return pactum
  //         .spec()
  //         .patch('/bookmarks/{id}')
  //         .withPathParams('id', '$S{bookmarkId}')
  //         .withHeaders({
  //           Authorization: 'Bearer $S{userAt}',
  //         })
  //         .withBody(dto)
  //         .expectStatus(200)
  //         .inspect();
  //     });
  //   });
  //   describe('Delete', () => {
  //     it('Should delete bookmarks', async () => {
  //       return pactum
  //         .spec()
  //         .delete('/bookmarks/{id}')
  //         .withPathParams('id', '$S{bookmarkId}')
  //         .withHeaders({
  //           Authorization: 'Bearer $S{userAt}',
  //         })
  //         .expectStatus(204);
  //     });

  //     it('Should get empty bookmarks', async () => {
  //       return pactum
  //         .spec()
  //         .get('/bookmarks')
  //         .withHeaders({
  //           Authorization: 'Bearer $S{userAt}',
  //         })
  //         .expectStatus(200);
  //     });
  //   });
  // });
});
