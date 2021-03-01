import { useEffect, useState } from "react";
import Link from 'next/link';
import Head from "next/head";
import 'isomorphic-fetch';

const pages = {
  index: {title: 'すべてのTodo', fetchQuery: ''},
  active: {title: '未完了のTodo', fetchQuery: '?completed=false'},
  completed: {title: '完了したTodo', fetchQuery: '?completed=true'}
}

const pageLinks = Object.keys(pages).map((page, index) =>
  <Link href={`/${page === 'index' ? '' : page}`} key={index}>
    <a style={{marginRight: 10}}>{pages[page].title}</a>
  </Link>
)

export default function Todos(props) {
  const {title, fetchQuery} = pages[props.page]
  const [todos, setTodos] = useState([])
  useEffect(() => {
    // fetch(`/api/todos${fetchQuery}`)
    //   .then(async res => res.ok
    //     ? setTodos(await res.json())
    //     : alert(await res.text())
    //   )
    const eventSource = new EventSource('/api/todos/events')
    eventSource.addEventListener('message', e => {
      const todos = JSON.parse(e.data)
      setTodos(
        typeof completed === 'undefined'
          ? todos
          : todos.filter(todo => todo.completed === completed)
      )
    })
    eventSource.addEventListener('error', e => console.log('SSEエラー', e))
    return () => eventSource.close()
  }, [props.page])

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <h1>{title}</h1>
      <ul>
        {todos.map(({id, title, completed}) =>
          <li key={id}>
            <span style={completed ? {textDecorator: 'line-throught'}: {}}>{title}</span>
          </li>
        )}
      </ul>
      <div>{pageLinks}</div>
    </>
  )
}