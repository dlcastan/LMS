import styles from "./course.module.css";

export function ProgressBar({ percent }: { percent: number }) {
  return (
    <div
      className={styles.bar}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Avance del curso"
    >
      <span style={{ width: `${percent}%` }} />
    </div>
  );
}
