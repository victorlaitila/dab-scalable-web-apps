ALTER TABLE students
  ADD COLUMN enrollment_year INT DEFAULT 0;

UPDATE students
  SET enrollment_year = enrollments.year
  FROM enrollments
  WHERE students.id = enrollments.student_id;