import styles from './styles.module.scss';
import Link from 'next/link';
import { SignInButton } from '../SignInButton';

export const Header = () => {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        
        <Link href="/">
          <img src="/images/logo.svg" alt="Logo Meu Board" />
        </Link>
        
        <nav>
          <Link href="/">
            <a>HOME</a>
          </Link>

          <Link href="/taskboard">
            <a>TASK BOARD</a>
          </Link>
        </nav>

        <SignInButton />
      </div>
    </header>
  )
}