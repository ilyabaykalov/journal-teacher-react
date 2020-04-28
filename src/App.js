import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Route, useHistory } from 'react-router-dom';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

import { AddChapterButton, Chapter, host, Lessons } from './components';

library.add(fas);

function App() {
	const [chapters, updateChapters] = useState(null);
	const [colors, setColors] = useState(null);
	const [activeItem, setActiveItem] = useState(null);
	let history = useHistory();

	useEffect(() => {
		axios.get(`http://${ host.ip }:${ host.port }/chapters?_expand=color&_embed=lessons`).then(({ data }) => {
			updateChapters(data);
		}).then(() => {
			console.debug(`Списки задач успешно получены с сервера`);
		}).catch(error => {
			console.error('Не удалось получить списки задач с сервера');
			console.error(`Ошибка: ${ error }`);
			alert('Не удалось получить списки задач с сервера');
		});

		axios.get(`http://${ host.ip }:${ host.port }/colors`).then(({ data }) => {
			setColors(data);
		}).then(() => {
			console.debug(`Палитра цветов успешно получены с сервера`);
		}).catch(() => {
			console.error('Не удалось получить палитру цветов с сервера');
			alert('Не удалось получить палитру цветов с сервера');
		});
	}, []);

	useEffect(() => {
		const chapterId = Number(history.location.pathname.replace('/chapters/', ''));
		if (chapters) {
			const chapter = chapters.find(chapter => chapter.id === chapterId);
			setActiveItem(chapter);
		}
	}, [chapters, history.location.pathname]);

	/* chapter events */
	const onAddChapter = chapter => {
		const newChapter = [...chapters, chapter];
		updateChapters(newChapter);
	};

	/* lesson events */
	const onAddLesson = (chapterId, newLesson) => {
		const newChapter = chapters.map(item => {
			if (item.id === chapterId) {
				item.lessons = [...item.lessons, newLesson];
			}
			return item;
		});
		updateChapters(newChapter);
	};

	const onEditLesson = (chapterId, updLesson) => {
		Swal.fire({
			title: 'Введите текст задачи',
			input: 'text',
			inputValue: updLesson.text,
			showCancelButton: true,
			cancelButtonText: 'Отмена',
			confirmButtonColor: '#42B883',
			cancelButtonColor: '#C9D1D3',
			inputValidator: (value) => {
				if (!value) {
					return 'Поле не может быть пустым';
				}
			}
		}).then(({ value, dismiss }) => {
			if (value) {
				return [chapters.map(chapter => {
					if (chapter.id === chapterId) {
						chapter.lessons = chapter.lessons.map(lesson => {
							if (lesson.id === updLesson.id) {
								lesson.text = value;
							}
							return lesson;
						});
					}
					return chapter;
				}), value];
			} else return [null, dismiss];
		}).then(([chapter, value]) => {
			if (chapter && value) {
				updateChapters(chapter);
				axios.patch(`http://${ host.ip }:${ host.port }/lessons/${ updLesson.id }`, {
					text: value
				}).catch(error => {
					Swal.fire({
						icon: 'error',
						title: 'Не удалось изменить текст задачи'
					}).then(() => {
						console.error('Не удалось изменить текст задачи');
						console.error(`Ошибка: ${ error }`);
					});
				});
			}
		});
	};

	const onRemoveLesson = (chapterId, lessonId) => {
		let lessonName = '';
		chapters.forEach(chapter => {
			if (chapter.id === chapterId) {
				chapter.lessons = chapter.lessons.map(lesson => {
					if (lesson.id === lessonId) {
						lessonName = lesson.text;
					}
					return lesson;
				});
			}
			return chapter;
		});
		Swal.fire({
			title: `Вы уверены что хотите удалить задачу\n"${ lessonName }"?`,
			icon: 'question',
			confirmButtonColor: '#42B883',
			cancelButtonColor: '#C9D1D3',
			confirmButtonText: 'Да, удалить!',
			showCancelButton: true,
			cancelButtonText: 'Отмена'
		}).then(result => {
			if (result.value) {
				const newChapter = chapters.map(item => {
					if (item.id === chapterId) {
						item.lessons = item.lessons.filter(lesson => lesson.id !== lessonId);
					}
					return item;
				});
				updateChapters(newChapter);
				axios.delete(`http://${ host.ip }:${ host.port }/lessons/${ lessonId }`).then(() => {
					console.debug(`Задача '${ lessonName }' успешно удалена`);
				}).catch(error => {
					Swal.fire({
						icon: 'error',
						title: 'Не удалось удалить список'
					}).then(() => {
						console.error('Не удалось удалить список');
						console.error(`Ошибка: ${ error }`);
					});
				});
			}
		});
	};

	const onCompleteLesson = (chapterId, lessonId, completed) => {
		const newChapter = chapters.map(chapter => {
			if (chapter.id === chapterId) {
				chapter.lessons = chapter.lessons.map(lesson => {
					if (lesson.id === lessonId) {
						lesson.completed = completed;
					}
					return lesson;
				});
			}
			return chapter;
		});
		updateChapters(newChapter);
		axios.patch(`http://${ host.ip }:${ host.port }/lessons/${ lessonId }`, {
			completed
		}).catch(error => {
			console.error('Не удалось обновить задачу');
			console.error(`Ошибка: ${ error }`);
			alert('Не удалось обновить задачу');
		});
	};

	const onEditChapterTitle = (id, title) => {
		const newChapter = chapters.map(item => {
			if (item.id === id) {
				item.name = title;
			}
			return item;
		});
		updateChapters(newChapter);
	};

	return (
		<div className='todo'>
			<div className='todo__sidebar'>
				<Chapter onClickItem={ () => {
					history.push(`/`);
				} } items={ [{
					active: history.location.pathname === '/',
					icon: 'list',
					name: 'Все задачи'
				}] }/>
				{ chapters ? (
					<Chapter items={ chapters }
					         onRemove={ id => {
						         const newChapters = chapters.filter(item => item.id !== id);
						         setActiveItem(chapters.find(item => item.id === id));
						         updateChapters(newChapters);
					         } }
					         onClickItem={ chapter => {
						         history.push(`/chapters/${ chapter.id }`);
					         } }
					         activeItem={ activeItem }
					         isRemovable/>
				) : (
					<div className='loading'>
						<FontAwesomeIcon className={ 'icon fa-spin' }
						                 icon='spinner'/>
						<p>Загрузка...</p>
					</div>
				) }
				<AddChapterButton colors={ colors }
				                  onAdd={ onAddChapter }/>
			</div>
			<div className='todo__lessons'>
				<Route exact path='/'>
					{ chapters && chapters.map(chapter => (
						<Lessons key={ chapter.id }
						         chapter={ chapter }
						         onAddLesson={ onAddLesson }
						         onEditTitle={ onEditChapterTitle }
						         onRemoveLesson={ onRemoveLesson }
						         onEditLesson={ onEditLesson }
						         onCompleteLesson={ onCompleteLesson }
						         withoutEmpty/>
					)) }
				</Route>
				<Route path='/chapters/:id'>
					{ chapters && activeItem && (
						<Lessons
							chapter={ activeItem }
							onAddLesson={ onAddLesson }
							onEditTitle={ onEditChapterTitle }
							onRemoveLesson={ onRemoveLesson }
							onEditLesson={ onEditLesson }
							onCompleteLesson={ onCompleteLesson }/>
					) }
				</Route>
			</div>
		</div>
	);
}

export default App;
