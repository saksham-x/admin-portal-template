import type { Ref } from "vue"
import { defineStore } from "pinia"
import type { AcademicLevelView } from "@/types/academic/level/AcademicLevel"
import type { AcademicYearView } from "@/types/academic/year/AcademicYear"
import type { GradeView } from "@/types/grade/Grade"
import type { CourseView } from "@/types/course/Course"
import type { ProgramView } from "@/types/program/Program"
import AcademicService from "@/services/academic/AcadmicService"
import ProgramService from "@/services/program/ProgramService"
import GradeService from "@/services/grade/GradeService"
import CourseService from "@/services/course/CourseService"
import ClassroomService from "@/services/classroom/ClassRoomService"

type Id = number | string;

export const useAcademicsStore = defineStore("academics", () => {
  // state
  const levels = ref<AcademicLevelView[]>([])
  const years = ref<AcademicYearView[]>([])
  const programsByLevel = ref<Record<Id, ProgramView[]>>({})
  const gradesByProgram = ref<Record<string, GradeView[]>>({})
  const coursesByKey = ref<Record<string, CourseView[]>>({})
  const classroomsByCourse = ref<Record<number, any[]>>({})

  const loading = reactive({
    levels: false,
    years: false,
    programs: {} as Record<Id, boolean>,
    grades: {} as Record<string, boolean>,
    courses: {} as Record<string, boolean>,
    classrooms: {} as Record<number, boolean>,
  })

  // services
  const academicService = new AcademicService()
  const programService = new ProgramService()
  const gradeService = new GradeService()
  const courseService = new CourseService()
  const classroomService = new ClassroomService()

  // helpers
  type Identifiable = { id: Id }

  const cacheKeyForCourse = (levelId: Id, programId: Id, yearId: Id) =>
    `${levelId}-${programId}-${yearId}`

  const programCacheKey = (programId: Id) => String(programId)

  const replaceOrAppend = <T extends Identifiable>(target: Ref<T[]>, entry: T) => {
    const index = target.value.findIndex((existing: T) => existing.id === entry.id)

    target.value =
      index === -1
        ? [...target.value, entry]
        : [...target.value.slice(0, index), entry, ...target.value.slice(index + 1)]
  }

  const removeById = <T extends Identifiable>(target: Ref<T[]>, id: Id) => {
    target.value = target.value.filter((existing: T) => existing.id !== id)
  }

  // actions
  const getAllAcademicLevels = async (force = false) => {
    if (!force && levels.value.length) return levels.value
    loading.levels = true
    try {
      const { data } = await academicService.getAllAcademicLevels()

      levels.value = data.filter((i: AcademicLevelView) => i.is_active)

      return levels.value
    } finally {
      loading.levels = false
    }
  }

  const getAllAcademicYears = async (force = false) => {
    if (!force && years.value.length) return years.value
    loading.years = true
    try {
      const { data } = await academicService.getAllAcademicYears()

      years.value = data.filter((i: AcademicYearView) => i.is_active)

      return years.value
    } finally {
      loading.years = false
    }
  }

  const fetchProgramsByLevel = async (levelId: Id, force = false) => {
    if (programsByLevel.value[levelId] && !force)
      return programsByLevel.value[levelId]
    loading.programs[levelId] = true
    try {
      // Using ProgramService list: we'll assume backend supports filter by level_id
      const { data } = await programService.paginate(
        { level_id: levelId },
        1,
      )

      programsByLevel.value[levelId] = data.filter(
        (p: ProgramView) => p.is_active,
      )

      return programsByLevel.value[levelId]
    } finally {
      loading.programs[levelId] = false
    }
  }

  // mutation helpers for dynamic updates
  const upsertLevel = (item: AcademicLevelView) => {
    if (!item.is_active) {
      // remove level and dependent caches
      const associatedPrograms = programsByLevel.value[item.id] || []

      removeById(levels, item.id)
      delete programsByLevel.value[item.id]

      // clear dependent grades/courses keyed by this level
      associatedPrograms.forEach((program: ProgramView) => {
        const gradeKey = programCacheKey(program.id)

        delete gradesByProgram.value[gradeKey]
        delete loading.grades[gradeKey]
      })

      for (const k of Object.keys(coursesByKey.value))
        if (k.startsWith(`${item.id}-`)) delete coursesByKey.value[k]

      return
    }
    replaceOrAppend(levels, item)
  }

  const upsertYear = (item: AcademicYearView) => {
    if (!item.is_active) {
      removeById(years, item.id)

      // remove dependent caches by year
      for (const k of Object.keys(coursesByKey.value))
        if (k.endsWith(`-${item.id}`)) delete coursesByKey.value[k]

      return
    }
    replaceOrAppend(years, item)
  }

  const upsertProgram = (item: ProgramView) => {
    const levelId = item.level_id
    if (!levelId) return
    const list = programsByLevel.value[levelId] || []
    if (!item.is_active) {
      programsByLevel.value[levelId] = list.filter(
        (program: ProgramView) => program.id !== item.id,
      )

      // clear grades/courses caches for this program across years
      const gradeKey = programCacheKey(item.id)

      delete gradesByProgram.value[gradeKey]
      delete loading.grades[gradeKey]
      for (const cacheKey of Object.keys(coursesByKey.value))
        if (cacheKey.split("-")[1] === String(item.id)) delete coursesByKey.value[cacheKey]

      return
    }
    const index = list.findIndex((program: ProgramView) => program.id === item.id)

    programsByLevel.value[levelId] =
      index === -1
        ? [...list, item]
        : [...list.slice(0, index), item, ...list.slice(index + 1)]
  }

  // stubs for grades/courses fetching - integrate when services are ready
  const getAllGrades = async (programId: Id, force = false) => {
    if (programId == null) return []

    const key = programCacheKey(programId)
    if (gradesByProgram.value[key] && !force) return gradesByProgram.value[key]
    loading.grades[key] = true
    try {
      const { data } = await gradeService.getAllGrades({
        program_id: programId,
      })

      const activeGrades = (data ?? []).filter(
        (grade: GradeView) => grade.is_active,
      )

      gradesByProgram.value[key] = activeGrades

      return activeGrades
    } finally {
      loading.grades[key] = false
    }
  }

  const getAllCourses = async (
    levelId: Id,
    programId: Id,
    yearId: Id,
    force = false,
  ) => {
    const key = cacheKeyForCourse(levelId, programId, yearId)
    if (coursesByKey.value[key] && !force) return coursesByKey.value[key]
    loading.courses[key] = true
    try {
      const { data } = await courseService.paginate({
        level_id: levelId,
        program_id: programId,
        year_id: yearId,

      })

      const activeCourses = (data ?? []).filter(
        (course: CourseView) => course.is_active,
      )

      coursesByKey.value[key] = activeCourses

      return activeCourses
    } finally {
      loading.courses[key] = false
    }
  }

  const getAllClassroomsByCourse = async (courseId: Id, force = false) => {
    if (!courseId) return []
    if (classroomsByCourse.value[Number(courseId)] && !force)
      return classroomsByCourse.value[Number(courseId)]

    loading.classrooms[Number(courseId)] = true
    try {
      const { data } = await classroomService.paginate({
        course_id: courseId,

        // per_page: 1000,
      }, 1)

      const activeClassrooms = (data ?? []).filter((c: any) => c.is_active)

      classroomsByCourse.value[Number(courseId)] = activeClassrooms

      return activeClassrooms
    } finally {
      loading.classrooms[Number(courseId)] = false
    }
  }


  const upsertGrade = (item: GradeView) => {
    if (item.program_id == null) return

    const key = programCacheKey(item.program_id)
    const list = gradesByProgram.value[key] || []
    if (!item.is_active) {
      gradesByProgram.value[key] = list.filter((g: GradeView) => g.id !== item.id)

      if (!gradesByProgram.value[key]?.length)
        delete gradesByProgram.value[key]

      return
    }
    const idx = list.findIndex((g: GradeView) => g.id === item.id)

    gradesByProgram.value[key] =
      idx === -1
        ? [...list, item]
        : [...list.slice(0, idx), item, ...list.slice(idx + 1)]
  }

  const upsertCourse = (item: CourseView) => {
    const key = cacheKeyForCourse(item.level_id, item.program_id, item.year_id)
    const list = coursesByKey.value[key] || []
    if (!item.is_active) {
      coursesByKey.value[key] = list.filter((c: any) => c.id !== item.id)

      return
    }
    const idx = list.findIndex((c: any) => c.id === item.id)

    coursesByKey.value[key] =
      idx === -1
        ? [...list, item]
        : [...list.slice(0, idx), item, ...list.slice(idx + 1)]
  }

  const clearInactive = () => {
    if (levels.value)
      levels.value = levels.value.filter((l: any) => l.is_active)
    if (years.value) years.value = years.value.filter((y: any) => y.is_active)
    for (const levelId of Object.keys(programsByLevel.value)) {
      programsByLevel.value[levelId] =
        programsByLevel.value[levelId]?.filter(
          (program: ProgramView) => program.is_active,
        ) ?? []
    }
  }

  const getAllCoursesAll = async (force = false) => {
    const key = '*' // special key for "all courses"
    if (coursesByKey.value[key] && !force) return coursesByKey.value[key]
    loading.courses[key] = true
    try {
      const { data } = await courseService.paginate({ per_page: 1000 })
      const active = (data ?? []).filter((c: CourseView) => c.is_active)

      coursesByKey.value[key] = active
      
      return active
    } finally {
      loading.courses[key] = false
    }
  }

  
  return {
    // state
    levels,
    years,
    programsByLevel,
    gradesByProgram,
    coursesByKey,
    loading,
    classroomsByCourse,

    // getters (via composition consumers)
    // actions
    getAllCoursesAll,
    getAllClassroomsByCourse,
    getAllAcademicLevels,
    getAllAcademicYears,
    fetchProgramsByLevel,
    getAllGrades,
    getAllCourses,
    upsertLevel,
    upsertYear,
    upsertProgram,
    upsertGrade,
    upsertCourse,
    clearInactive,
  }
})
