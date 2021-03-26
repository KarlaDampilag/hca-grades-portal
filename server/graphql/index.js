import gts from '@graphql-tools/schema';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import _ from 'lodash';

import User from '../models/User.js';
import Section from '../models/Section.js';
import Class from '../models/Class.js';
import Grade from '../models/Grade.js';

const APP_SECRET = 'sdlfkj08234lksdf'; // move to env

const { makeExecutableSchema } = gts;

const typeDefs = `
scalar Object
scalar Null

type User {
  id: String!
  firstName: String!
  lastName: String!
  middleInitial: String
  email: String!
  password: String!
  role: Object!
}
type Section {
  id: String!
  name: String!
  adviserId: User!
}
type Class {
  id: String!
  name: String!
  teacherId: User!
  sectionId: Section!
}
type Grade {
  id: String!
  studentId: User!
  classId: Class!
  scores: Object!
  quarter: Int!
}

input UserInput {
  id: String
  firstName: String
  lastName: String
  middleInitial: String
  email: String
  password: String
  role: Object
}
input GradeInput {
  id: String
  studentId: String!
  classId: String!
  scores: Object!
  quarter: Int!
}

type Query {
  me: User
  user(id: String!): User
  users(filter: UserInput): [User]
  studentsBySectionId(id: String!): [User]
  studentsByClassId(id: String!): [User]
  sections: [Section]
  section(id: String!): Section
  classes: [Class]
  classesBySectionId(sectionId: String!): [Class]
  class(id: String!): Class
  gradesByClassId(classId: String!, quarter: Int): [Grade]
  studentGradesByClassId(classId: String!): [Grade]
}
type Mutation {
  addUser(id: String!, firstName: String!, lastName: String!, middleInitial: String, email: String!, password: String!, role: Object!): User
  addUsers(users: [UserInput!]!): [User]
  deleteUsers: Null
  addSection(id: String!, name: String, adviserId: String!, students: [UserInput!]!): Section
  addClass(id: String!, name: String, teacherId: String!, sectionId: String!): Class
  addGrade(id: String!, studentId: String!, classId: String!, scores: Object!, quarter: Int!): Grade
  addGrades(grades: [GradeInput!]!, quarter: Int!): [Grade]
  login(email: String!, password: String!): User
  logout: Null
}
`;

const generateToken = (user) => {
  return jwt.sign({ data: user }, APP_SECRET);
};

const validateToken = (token) => {
  return jwt.verify(token, APP_SECRET);
};

const throwUnauthorizedError = () => {
  throw new Error('You are not authorized to perform this action!');
};

const protectEndpoint = async (context, role, callback) => {
  const cookies = context.req.cookies;
  if (cookies && cookies.token) {
    try {
      const decoded = validateToken(cookies.token);
      const userRole = decoded.data.role.type;
      if (role.includes(userRole)) {
        return await callback();
      } else {
        throwUnauthorizedError();
      }
    } catch (err) {
      throw new Error(err);
    }
  } else {
    throwUnauthorizedError();
  }
};

const getRequesterId = (context) => {
  const cookies = context.req.cookies;
  if (cookies && cookies.token) {
    const decoded = validateToken(cookies.token);
    return decoded.data._id;
  }
};

const getCurrentUser = (context) => {
  const cookies = context.req.cookies;
  if (cookies && cookies.token) {
    const decoded = validateToken(cookies.token);
    return decoded.data;
  }
};

const createUser = async (context, id, firstName, lastName, middleInitial, email, password, role) => {
  try {
    const hash = await bcrypt.hash(password, 10);
    const requesterId = getRequesterId(context);
    const user = await new User({ id, firstName, lastName, middleInitial, email, password: hash, role, createdAt: Date.now().toString(), createdBy: requesterId }).save();
    if (user) {
      return user;
    }
  } catch (err) {
    throw new Error(err);
  }
};

const createGrade = async (context, id, studentId, classId, scores, quarter) => {
  try {
    const requesterId = getRequesterId(context);
    const student = await User.findOne({ id: studentId }).exec();
    const myClass = await Class.findOne({ id: classId }).exec();
    if (!student) {
      throw new Error('Student not found');
    }
    if (!myClass) {
      throw new Error('Class not found');
    }
    const grade = await new Grade({ id, studentId: student._id, classId: myClass._id, scores, quarter, createdAt: Date.now().toString(), createdBy: requesterId }).save();
    grade.studentId = student;
    grade.classId = myClass;
    return grade;
  } catch (err) {
    throw new Error(err);
  }
};

const resolvers = {
  Query: {
    me: async (root, args, context) => {
      const requesterId = getRequesterId(context);
      if (!requesterId) {
        return null;
      } else {
        return await User.findById(requesterId);
      }
    },
    users: async (root, args, context) => {
      const callback = async () => {
        let filter = {};
        if (args.filter) {
          filter = args.filter;
        }

        try {
          const users = await User.find(filter).exec();
          if (users) {
            return users;
          }
        } catch (err) {
          throw new Error(err);
        }
      };
      return await protectEndpoint(context, ['admin', 'schoolAdmin'], callback);
    },
    studentsBySectionId: async (root, args, context) => {
      const callback = async () => {
        try {
          const section = await Section.findOne({ id: args.id });
          if (section) {
            const students = await User.find({});
            const filteredStudents = _.filter(students, student => {
              return student.role.sectionId && student.role.sectionId.toString() == section._id.toString();
            });
            return filteredStudents;
          } else {
            throw new Error('Section not found');
          }
        } catch (err) {
          throw new Error(err);
        }
      };

      return await protectEndpoint(context, ['admin', 'schoolAdmin', 'teacher'], callback);
    },
    studentsByClassId: async (root, args, context) => {
      const callback = async () => {
        try {
          const myClass = await Class.findOne({ id: args.id });
          if (myClass) {
            const section = await Section.findById(myClass.sectionId);
            if (section) {
              const students = await User.find({});
              const filteredStudents = _.filter(students, student => {
                return student.role.sectionId && student.role.sectionId.toString() == section._id.toString();
              });
              return filteredStudents;
            } else {
              throw new Error('Section not found');
            }
          } else {
            throw new Error('Class not found');
          }
        } catch (err) {
          throw new Error(err);
        }
      };

      return await protectEndpoint(context, ['admin', 'schoolAdmin', 'teacher'], callback);
    },
    sections: async (root, args, context) => {
      const callback = async () => {
        try {
          const sections = await Section.find({}).exec();
          if (sections) {
            for (const section of sections) {
              const adviser = await User.findById(section.adviserId).exec();
              if (adviser) {
                section.adviserId = adviser;
              }
            }
            return sections;
          }
        } catch (err) {
          throw new Error(err);
        }
      };
      return await protectEndpoint(context, ['admin', 'schoolAdmin', 'teacher'], callback);
    },
    section: async (root, args, context) => {
      const callback = async () => {
        try {
          const section = await Section.findOne({ id: args.id });
          if (section) {
            const adviser = await User.findById(section.adviserId).exec();
            if (adviser) {
              section.adviserId = adviser;
            }
            return section;
          } else {
            throw new Error('Section not found');
          }
        } catch (err) {
          throw new Error(err);
        }
      };
      return await protectEndpoint(context, ['admin', 'schoolAdmin', 'teacher'], callback);
    },
    classes: async (root, args, context) => {
      const callback = async () => {
        try {
          const myClasses = await Class.find({}).exec();
          if (myClasses) {
            for (const myClass of myClasses) {
              const teacher = await User.findById(myClass.teacherId).exec();
              const section = await Section.findById(myClass.sectionId).exec();
              if (teacher) {
                myClass.teacherId = teacher;
              } else {
                throw new Error('Teacher not found');
              }
              if (section) {
                myClass.sectionId = section;
              } else {
                throw new Error('Section not found');
              }
            }
            return myClasses;
          }
        } catch (err) {
          throw new Error(err);
        }
      };
      return await protectEndpoint(context, ['admin', 'schoolAdmin', 'teacher'], callback);
    },
    classesBySectionId: async (root, args, context) => {
      const callback = async () => {
        try {
          const section = await Section.findById(args.sectionId);
          if (!section) {
            throw new Error('Section not found');
          }

          const classes = await Class.find().exec();

          const filteredClasses = _.filter(classes, thisClass => {
            return thisClass.sectionId.toString() == section._id.toString();
          });

          if (filteredClasses) {
            for (const thisClass of filteredClasses) {
              const teacher = await User.findById(thisClass.teacherId).exec();
              thisClass.teacherId = teacher;
              thisClass.sectionId = section;
            }
            return filteredClasses;
          } else {
            return [];
          }
        } catch (err) {
          throw new Error(err);
        }
      };
      return await protectEndpoint(context, ['admin', 'schoolAdmin', 'teacher', 'student'], callback);
    },
    class: async (root, args, context) => {
      const callback = async () => {
        try {
          const myClass = await Class.findOne({ id: args.id });
          if (myClass) {
            const teacher = await User.findById(myClass.teacherId).exec();
            const section = await Section.findById(myClass.sectionId).exec();
            if (teacher) {
              myClass.teacherId = teacher;
            }
            if (section) {
              myClass.sectionId = section;
            }
            return myClass;
          } else {
            throw new Error('Class not found');
          }
        } catch (err) {
          throw new Error(err);
        }
      };
      return await protectEndpoint(context, ['admin', 'schoolAdmin', 'teacher'], callback);
    },
    gradesByClassId: async (root, args, context) => {
      const callback = async () => {
        try {
          const myClass = await Class.findOne({ id: args.classId });

          if (!myClass) {
            throw new Error('Class not found');
          }

          let filteredGrades = [];
          
          if (args.quarter) {
            filteredGrades = await Grade.find({ classId: myClass._id, quarter: args.quarter }).exec();
          } else {
            filteredGrades = await Grade.find({ classId: myClass._id}).exec();
          }

          if (!_.isEmpty(filteredGrades)) {
            for (const grade of filteredGrades) {
              const student = await User.findById(grade.studentId);
              grade.studentId = student;
              grade.classId = myClass;
            }
            return filteredGrades;
          } else {
            return [];
          }
        } catch (err) {
          throw new Error(err);
        }
      };
      return await protectEndpoint(context, ['admin', 'schoolAdmin', 'teacher'], callback);
    },
    studentGradesByClassId: async (root, args, context) => {
      const callback = async () => {
        try {
          const myClass = await Class.findOne({ id: args.classId });

          if (!myClass) {
            throw new Error('Class not found');
          }

          const user = getCurrentUser(context);
          const grades = await Grade.find({ classId: myClass._id, studentId: user._id }).exec();

          if (!_.isEmpty(grades)) {
            for (const grade of grades) {
              grade.studentId = user;
              grade.classId = myClass;
            }
            return grades;
          } else {
            return [];
          }
        } catch (err) {
          throw new Error(err);
        }
      };
      return await protectEndpoint(context, ['admin', 'student'], callback);
    }
  },
  Mutation: {
    addUser: async (root, { id, firstName, lastName, middleInitial, email, password, role }, context) => {
      const callback = async () => {
        return await createUser(context, id, firstName, lastName, middleInitial, email, password, role);
      };

      return await protectEndpoint(context, ['admin', 'schoolAdmin'], callback);
    },

    addUsers: async (root, { users }, context) => {
      const callback = async () => {
        const newUsers = [];
        for (const user of users) {
          const { id, firstName, lastName, middleInitial, email, password, role } = user;
          const newUser = await createUser(context, id, firstName, lastName, middleInitial, email, password, role);
          newUsers.push(newUser);
        }
        return newUsers;
      };

      return await protectEndpoint(context, ['admin', 'schoolAdmin'], callback);
    },

    deleteUsers: async (root, args, context) => {
      const callback = async () => {
        const users = await User.find().exec();
        const nonAdmin = users.filter(user => {
          return user.role.type != 'admin';
        });
        for (const user of nonAdmin) {
          await User.deleteOne({ id: user.id }).exec();
        }
      };

      return await protectEndpoint(context, ['admin'], callback);
    },

    addSection: async (root, { id, name, adviserId, students }, context) => {
      const callback = async () => {
        try {
          const requesterId = getRequesterId(context);
          const adviser = await User.findOne({ id: adviserId }).exec();
          if (adviser) {
            const section = await new Section({ id, name, adviserId: adviser._id, createdAt: Date.now().toString(), createdBy: requesterId }).save();
            if (section) {
              const newStudents = [];
              for (const student of students) {
                const { id, firstName, lastName, middleInitial, email, password, role } = student;
                role.sectionId = section._id;
                const newUser = await createUser(context, id, firstName, lastName, middleInitial, email, password, role);
                newStudents.push(newUser);
              }
              return section;
            }
          } else {
            throw new Error('Adviser not found');
          }
        } catch (err) {
          throw new Error(err);
        }
      };
      return await protectEndpoint(context, ['admin', 'schoolAdmin', 'teacher'], callback);
    },

    addClass: async (root, { id, name, teacherId, sectionId }, context) => {
      const callback = async () => {
        try {
          const requesterId = getRequesterId(context);
          const teacher = await User.findOne({ id: teacherId }).exec();
          const section = await Section.findOne({ id: sectionId }).exec();
          if (!teacher) {
            throw new Error('Teacher not found');
          }
          if (!section) {
            throw new Error('Section not found');
          }
          const newClass = await new Class({ id, name, teacherId: teacher._id, sectionId: section._id, createdAt: Date.now().toString(), createdBy: requesterId }).save();
          newClass.teacherId = teacher;
          newClass.sectionId = section;
          return newClass;
        } catch (err) {
          throw new Error(err);
        }
      };
      return await protectEndpoint(context, ['admin', 'schoolAdmin', 'teacher'], callback);
    },

    addGrade: async (root, { id, studentId, classId, scores, quarter }, context) => {
      const callback = async () => {
        return await createGrade(context, id, studentId, classId, scores, quarter);
      };
      return await protectEndpoint(context, ['admin', 'schoolAdmin', 'teacher'], callback);
    },

    addGrades: async (root, { grades, quarter }, context) => {
      const callback = async () => {
        const classId = grades[0].classId;
        const myClass = await Class.findOne({ id: classId });
        await Grade.deleteMany({ classId: myClass._id, quarter });

        const newGrades = [];
        for (const grade of grades) {
          const { id, studentId, classId, scores, quarter } = grade;
          const newGrade = await createGrade(context, id, studentId, classId, scores, quarter);
          newGrades.push(newGrade);
        }
        return newGrades;
      };
      return await protectEndpoint(context, ['admin', 'schoolAdmin', 'teacher'], callback);
    },

    login: async (root, { email, password }, context) => {
      try {
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error('Invalid email or password');
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          throw new Error('Invalid email or password');
        }

        const token = generateToken(user);
        context.res.cookie('token', token, {
          httpOnly: true,
          maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year cookie,
          sameSite: 'none',
          secure: true
        });

        return user;
      } catch (err) {
        throw new Error(err);
      }
    },
    logout: async (root, args, context) => {
      try {
        context.res.clearCookie('token');
      } catch (err) {
        throw new Error(err);
      }
    }
  }
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
});

export default schema;