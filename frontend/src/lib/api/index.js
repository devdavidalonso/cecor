import authService from './auth';
import userService from './users';
import courseService from './courses';
import enrollmentService from './enrollments';
import profileService from './profile';

// Exportando todos os serviços em um único objeto
export {
  authService,
  userService,
  courseService,
  enrollmentService,
  profileService
};

// Exportação padrão de todos os serviços
export default {
  auth: authService,
  users: userService,
  courses: courseService,
  enrollments: enrollmentService,
  profile: profileService
};