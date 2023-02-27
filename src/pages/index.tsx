import type { NextPage } from 'next'
import Head from 'next/head'

import styles from '../styles/Home.module.css'
import TaskList from '../features/task-reference-redux/TaskList'

const IndexPage: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Autority Challenge</title>
      </Head>
      <header className={styles.header}>
        <TaskList />
      </header>
    </div>
  )
}

export default IndexPage
