import {} from "npm:@types/google-apps-script";

type Course = GoogleAppsScript.Classroom.Schema.Course;
type CourseWork = GoogleAppsScript.Classroom.Schema.CourseWork;
type Formatted = {
  name: string;
  description: string;
  dueDate: {
    year: number;
    month: number;
    day: number;
  } | undefined;
  link: string;
};

declare let global: {
  doGet: (
    e?: GoogleAppsScript.Events.DoGet,
  ) => GoogleAppsScript.HTML.HtmlOutput | GoogleAppsScript.Content.TextOutput;
  doPost: (
    e?: GoogleAppsScript.Events.DoPost,
  ) => GoogleAppsScript.HTML.HtmlOutput | GoogleAppsScript.Content.TextOutput;
  [key: string]: () => void;
  getCourseList: () => Course[] | undefined;
  getCourseIds: () => string[] | undefined;
  getAssignments: () => CourseWork[] | undefined;
  filterAssignmentsByDate: (
    allAssignments: CourseWork[],
    date: Date,
  ) => CourseWork[] | undefined;
  formatAssignments: (assignments: CourseWork[]) => Formatted[];
};

global.getCourseList = () => {
  const courses = Classroom.Courses;

  if (courses === undefined) return undefined;

  const list = courses.list().courses;
  return list;
};

global.getCourseIds = () => {
  const courseList = global.getCourseList();

  if (courseList === undefined) return undefined;

  const ids = courseList.map((x) => x.id).filter((x): x is string =>
    x !== undefined
  );
  return ids;
};

global.getAssignments = () => {
  const ids = global.getCourseIds();

  if (ids === undefined) return undefined;

  const assignments = ids.map((id) => {
    if (
      id === undefined || Classroom.Courses === undefined ||
      Classroom.Courses.CourseWork === undefined
    ) return undefined;
    return Classroom.Courses.CourseWork.list(id).courseWork;
  }).filter((x): x is CourseWork[] => x !== undefined).flat();

  return assignments;
};

global.filterAssignmentsByDate = (allAssignments: CourseWork[], date: Date) => {
  const assignments = allAssignments.filter((x): x is CourseWork => {
    const d = x.dueDate;

    if (
      d === undefined || d.year === undefined || d.month === undefined ||
      d.day === undefined
    ) return false;

    const assignmentsDate = new Date(d.year, d.month, d.day);
    if (assignmentsDate < date) return false;

    return true;
  });

  return assignments;
};

global.formatAssignments = (assignments: CourseWork[]): Formatted[] => {
  const formatted = assignments.map((x) => {
    return {
      name: x.title !== undefined ? x.title : "",
      description: x.description !== undefined ? x.description : "",
      dueDate: x.dueDate !== undefined
        ? {
          year: x.dueDate.year ?? 1970,
          month: x.dueDate.month ?? 1,
          day: x.dueDate.day ?? 1,
        }
        : undefined,
      link: x.alternateLink !== undefined ? x.alternateLink : "",
    } satisfies Formatted;
  });

  return formatted;
};

global.doGet = (e?) => {
  if (e === undefined) {
    return ContentService.createTextOutput().setContent(
      JSON.stringify({ status: "error", value: undefined }),
    );
  }

  const assignments = global.getAssignments();
  if (assignments === undefined) {
    return ContentService.createTextOutput().setContent(
      JSON.stringify({ status: "error", value: undefined }),
    );
  }

  const filterAssignments = global.filterAssignmentsByDate(
    assignments,
    new Date(
      Number(e.parameters.year),
      Number(e.parameters.month),
      Number(e.parameters.day),
    ),
  );

  if (filterAssignments === undefined) {
    return ContentService.createTextOutput().setContent(
      JSON.stringify({ status: "error", value: undefined }),
    );
  }
  const formatted = global.formatAssignments(filterAssignments);

  return ContentService.createTextOutput().setContent(
    JSON.stringify({ status: "ok", value: formatted }),
  );
};
