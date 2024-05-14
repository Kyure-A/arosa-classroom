import {} from "npm:@types/google-apps-script";

type Course = GoogleAppsScript.Classroom.Schema.Course;
type ListCourseWorkResponse = GoogleAppsScript.Classroom.Schema.ListCourseWorkResponse;

declare let global: {
  doGet: (e?: GoogleAppsScript.Events.DoGet) =>
    | GoogleAppsScript.HTML.HtmlOutput | GoogleAppsScript.Content.TextOutput;
  doPost: (e?: GoogleAppsScript.Events.DoPost) =>
    | GoogleAppsScript.HTML.HtmlOutput | GoogleAppsScript.Content.TextOutput;
  [key: string]: () => void;
  getCourseList: () => Course[] | undefined;
  getCourseIds: () => string[] | undefined;
  getAssignments: () => ListCourseWorkResponse[] | undefined;
};

global.getCourseList = () => {
  const courses = Classroom.Courses;

  if (courses === undefined) return undefined;

  const list = courses.list().courses;
  return list;
}

global.getCourseIds = () => {
  const courseList = global.getCourseList();

  if (courseList === undefined) return undefined;

  const ids = courseList.map((x) => x.id).filter((x): x is string => x !== undefined);
  return ids
}

global.getAssignments = () => {
  const ids = global.getCourseIds();

  if (ids === undefined) return undefined;

  const assignments = ids.map((id) => {
    if (id === undefined || Classroom.Courses === undefined || Classroom.Courses.CourseWork === undefined) return undefined;
    return Classroom.Courses.CourseWork.list(id);
  }).filter((x): x is ListCourseWorkResponse => x !== undefined);

  return assignments;
}
