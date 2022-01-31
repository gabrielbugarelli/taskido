import { GetServerSideProps } from 'next';
import { getSession } from 'next-auth/client';
import { useState, FormEvent } from 'react';
import firebase from '../../services/firebaseConnection';
import { format } from 'date-fns';

import Head from 'next/head';
import Link from 'next/link';
import { SupportButton } from '../../components/SupportButton';

import { FiPlus, FiCalendar, FiEdit2, FiTrash, FiClock } from 'react-icons/fi';
import styles from './styles.module.scss';

type TaskList = {
  id: string;
  created: string | Date;
  createdFormated?: string;
  task: string;
  userId: string;
  name: string;
}

type BoardProps = {
  user: {
    id: string,
    name: string
  }
  data: string
}

const TaskBoard = ({ user, data }: BoardProps) => {

  const [ inputTask, setInputTask ] = useState<string>('');
  const [ tasklist, setTaskList ] = useState<TaskList[]>(JSON.parse(data));

  /** 
   * @param event -> executa método para impedir carregamento padrão do form.
   */
  const handleAddTask = async (event: FormEvent) => {
    event.preventDefault();

    if( inputTask === '') {
      alert('Preencha uma tarefa!');
      return;
    }

    await firebase.firestore()
      .collection('tasks')
      .add({
        userId: user.id,
        task: inputTask,
        name: user.name,
        created: new Date()
      })
      .then((doc) => {
        let data = {
          id: doc.id,
          created: new Date(),
          createdFormated: format(new Date(), "dd MMMM yyyy"),
          task: inputTask,
          userId: user.id,
          name: user.name
        }

        setTaskList([...tasklist, data]);
        setInputTask('');
      })
      .catch((error) => {
        console.warn(`ERRO AO CADASTRAR: ${error}`);
      })
  }

  const hadleDeleteTask = async (id: string) => {
    await firebase.firestore().collection('tasks').doc(id)
    .delete()
    .then(() => {
      let taskDeleted = tasklist.filter(item => {
        return item.id !== id;
      })

      setTaskList(taskDeleted);
    })

    .catch((error) => {
      console.warn(`ERRO AO DELETAR: ${error}`);
    })
  }

  return (
    <>
      <Head>
        <title>Minhas tarefas - TaskBoard</title>
      </Head>

      <main className={styles.container}>
        <form onSubmit={handleAddTask}>
          <input 
            type="text"
            autoFocus
            value={inputTask}
            onChange={(value) => setInputTask(value.target.value)}
            placeholder='o que pretende fazer hoje?'
          />

          <button type="submit">
            <FiPlus size={25} color="#17181f"/>
          </button>
        </form>

        <h1>Você tem {tasklist.length} {tasklist.length === 1 ? 'tarefa!' : 'tarefas!'}</h1>

        <section>
          {tasklist.map( task => (
            <article className={styles.taskList} key={task.id}>
              <Link href={`/board/${task.id}`}>
                <p>{task.task}</p>
              </Link>
              <div className={styles.actions}>
                <div>
                  <div>
                    <FiCalendar size={20} color="#ffb800"/>
                    <time>{task.createdFormated}</time>
                  </div>

                  <button>
                    <FiEdit2 size={20} color="azure" />
                    <span>Editar</span>
                  </button>
                </div>

                <button onClick={() => hadleDeleteTask(task.id)}>
                  <FiTrash size={20} color="#ff3636"/>
                  <span>Excluir</span>
                </button>
              </div>
            </article>
          ))}
        </section>
      </main>

      <footer  className={styles.vipContainer}>
        <div>
          <FiClock color='azure' size={25} />
          <time>
            Última colaboração foi a 3 dias.
          </time>
        </div>

        <p>Feito com ❤️ <a href="https://github.com/gabrielbugarelli" target='_blank'>@gabrielbugarelli</a></p>
      </footer>

      <SupportButton />
    </>
  )
}

export default TaskBoard;

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const session = await getSession({ req });

  //Se não tiver um usuário autenticado, redireciona para a página inicial
  if(!session?.id) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    }
  }

  const tasks = await firebase.firestore().collection('tasks')
  .where('userId', '==', session?.id)
  .orderBy('created', 'asc').get();

  const data = JSON.stringify(tasks.docs.map( item => {
      return {
        id: item.id,
        createdFormated: format(item.data().created.toDate(), "dd MMMM yyyy"),
        ...item.data()
      }
    })
  )

  const user = {
    id: session?.id,
    name: session?.user.name
  }

  return {
    props: {
      user,
      data
    }
  }
}