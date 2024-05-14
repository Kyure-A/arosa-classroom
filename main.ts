import {} from "npm:@types/google-apps-script";

declare let global: {
  doGet: (e?: GoogleAppsScript.Events.DoGet) =>
    | GoogleAppsScript.HTML.HtmlOutput | GoogleAppsScript.Content.TextOutput;
  doPost: (e?: GoogleAppsScript.Events.DoPost) =>
    | GoogleAppsScript.HTML.HtmlOutput | GoogleAppsScript.Content.TextOutput;
  [key: string]: () => void;
  getCourseList: () => GoogleAppsScript.Classroom.Schema.Course[] | undefined;
  getCourseIds: () => (string | undefined)[] | undefined;
  getAssignments: () => (GoogleAppsScript.Classroom.Schema.ListCourseWorkResponse | undefined)[] | undefined;
  sanitizeUndefined: (x: unknown[]) => unknown[];
};

global.sanitizeUndefined = (x: unknown[]) =>  {
  return x.filter((x) => x !== undefined);
}

global.getCourseList = () => {
  const courses = Classroom.Courses;

  if (courses === undefined) return undefined;

  const list = courses.list().courses;
  return list;
}

global.getCourseIds = () => {
  const courseList = global.getCourseList();

  if (courseList === undefined) return undefined;

  const ids = courseList.map((x) => x.id);
  return ids
}

global.getAssignments = () => {
  const ids = global.getCourseIds();
  if (ids === undefined) return undefined;

  const assignments = ids.map((id) => {
    if (id === undefined || Classroom.Courses === undefined || Classroom.Courses.CourseWork === undefined) return undefined;
    return Classroom.Courses.CourseWork.list(id);
  })

  return assignments;
}
