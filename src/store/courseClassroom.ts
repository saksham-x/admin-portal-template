import { CourseView } from "@/types/course/Course"
import { defineStore } from "pinia"
import { ref, reactive } from "vue"
import ClassroomService from "@/services/classroom/ClassRoomService"
import type { ClassroomView } from "@/types/classroom/Classroom"

type Id = number | string;

export const useClassroomCoursesStore = defineStore("classroomCourses", () => {
  const svc = new ClassroomService()

  // state
  const classrooms = ref<ClassroomView[]>([])
  const coursesByClassroom = ref<Record<Id, CourseView[]>>({})

  const loading = reactive({
    classrooms: false,
    courses: {} as Record<Id, boolean>,
  })

  // actions
  const fetchClassrooms = async (force = false) => {
    if (!force && classrooms.value.length) return classrooms.value
    loading.classrooms = true
    try {

      const { data } = await svc.listAll()

      const filtered = (data ?? []).filter((c: any) => c?.is_active !== false)

      classrooms.value = filtered
      
      return classrooms.value
    } catch (error) {
      showError(error)
    } finally {
      loading.classrooms = false
    }
  }

  const fetchCoursesByClassroom = async (classroomId: Id, force = false) => {
    if (!classroomId) return []
    if (coursesByClassroom.value[classroomId] && !force)
      return coursesByClassroom.value[classroomId]
    loading.courses[classroomId] = true
    try {
      const { data } = await svc.listCourses(classroomId)
      const list = (data ?? []).filter((c: any) => c?.is_active !== false)

      coursesByClassroom.value[classroomId] = list
      
      return list
    } finally {
      loading.courses[classroomId] = false
    }
  }

  return {
    classrooms,
    coursesByClassroom,
    loading,
    fetchClassrooms,
    fetchCoursesByClassroom,
  }
})
