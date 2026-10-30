import styles from './Physics.module.css'

// A formula, written large, with what each symbol means beneath it. `expr` is plain text; use <sub> and <sup> for small numbers.
export default function Formula({ name, expr, symbols = [], note }) {
  return (
    <figure className={styles.formula}>
      <figcaption className={styles.formulaName}>{name}</figcaption>
      <p className={styles.expr}>{expr}</p>
      {symbols.length > 0 && (
        <dl className={styles.symbols}>
          {symbols.map(([symbol, meaning]) => (
            <div key={symbol}>
              <dt>{symbol}</dt>
              <dd>{meaning}</dd>
            </div>
          ))}
        </dl>
      )}
      {note && <p className={styles.formulaNote}>{note}</p>}
    </figure>
  )
}

// A block of explanation, one idea at a time
export function Idea({ title, children }) {
  return (
    <section className={styles.idea}>
      <h3>{title}</h3>
      {children}
    </section>
  )
}
