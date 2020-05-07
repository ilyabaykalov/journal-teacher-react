import React, { useState } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';

library.add(fas);

const Lesson = ({ id, title, homework, lessonMark, homeworkMark, completed, chapter, onRemove, onEdit, onComplete }) => {
	const [titleClassNames, setTitleClassNames] = useState(completed ? 'title completed' : 'title');
	const [lessonCheckClassNames, setLessonCheckClassNames] = useState(!lessonMark ? '' : lessonMark >= 4 ? 'good' : 'bad');
	const [homeworkIconClassNames, setHomeworkIconClassNames] = useState(!homeworkMark ? 'homework-icon' : homeworkMark >= 4 ? 'homework-icon good' : 'homework-icon bad');

	const onChangeCheckbox = e => {
		onComplete(chapter.id, id, e.target.checked);
		setTitleClassNames(e.target.checked ? 'title completed' : 'title');
	};

	return (
		<div key={ id } className='lessons__items-row'>
			<div className='titleWithCheckbox'>
				<div className='checkbox'>
					<input id={ `lesson-${ id }` }
					       type='checkbox'
					       checked={ completed }
					       onChange={ onChangeCheckbox }/>
					<label className={ lessonCheckClassNames } htmlFor={ `lesson-${ id }` }>
						{ !lessonMark && <FontAwesomeIcon className='lessons__items-row__complete-button'
						                                  icon='question'/> }
						{ lessonMark && lessonMark >= 4 &&
						<FontAwesomeIcon className='lessons__items-row__complete-button'
						                 icon='check'/> }
						{ lessonMark && lessonMark <= 3 &&
						<FontAwesomeIcon className='lessons__items-row__complete-button'
						                 icon='times'/> }
					</label>
				</div>
				<p className={ titleClassNames }>{ title }
					{
						homework &&
						<FontAwesomeIcon className={ homeworkIconClassNames } icon='book'/>
					}
				</p>
			</div>
			<div className='mark'>
				<p>{ !lessonMark ? 'Нет оценки за урок' : `Оценка за урок: ${ lessonMark }` }</p>
				<p>{ !homeworkMark ? 'Нет оценки за д/з' : `Оценка за д/з: ${ homeworkMark }` }</p>
			</div>
			<div className='lessons__items-row-actions'>
				<div onClick={ () => onEdit(chapter.id, {
					id,
					title,
					homework,
					lessonMark,
					homeworkMark
				}, setHomeworkIconClassNames, setLessonCheckClassNames) }>
					<FontAwesomeIcon className={ 'lessons__items-row-actions__edit-button' }
					                 icon={ 'pen' }/>
				</div>
				<div onClick={ () => onRemove(chapter.id, id) }>
					<FontAwesomeIcon className={ 'lessons__items-row-actions__remove-button' }
					                 icon={ 'times' }/>
				</div>
			</div>
		</div>
	);
};

export default Lesson;
