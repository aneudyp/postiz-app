'use client';

import { FC } from 'react';
import { useIntegration } from '@gitroom/frontend/components/launches/helpers/use.integration';
import { useLaunchStore } from '@gitroom/frontend/components/new-launch/store';
import { useMediaDirectory } from '@gitroom/react/helpers/use.media.directory';
import { stripHtmlValidation } from '@gitroom/helpers/utils/strip.html.validation';
import { textSlicer } from '@gitroom/helpers/utils/count.length';
import { VideoOrImage } from '@gitroom/react/helpers/video.or.image';
import clsx from 'clsx';

const XActions: FC<{ isThread?: boolean }> = ({ isThread }) => (
  <div
    className={clsx(
      'flex items-center justify-between text-[#71767B] mt-[12px]',
      isThread && 'mt-[8px]'
    )}
  >
    {/* Reply */}
    <div className="flex items-center gap-[4px] group cursor-pointer hover:text-[#1D9BF0] transition-colors">
      <div className="p-[8px] rounded-full group-hover:bg-[#1D9BF01A] transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z" />
        </svg>
      </div>
      <span className="text-[13px]">4</span>
    </div>

    {/* Repost */}
    <div className="flex items-center gap-[4px] group cursor-pointer hover:text-[#00BA7C] transition-colors">
      <div className="p-[8px] rounded-full group-hover:bg-[#00BA7C1A] transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z" />
        </svg>
      </div>
      <span className="text-[13px]">12</span>
    </div>

    {/* Like */}
    <div className="flex items-center gap-[4px] group cursor-pointer hover:text-[#F91880] transition-colors">
      <div className="p-[8px] rounded-full group-hover:bg-[#F918801A] transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z" />
        </svg>
      </div>
      <span className="text-[13px]">48</span>
    </div>

    {/* Views */}
    <div className="flex items-center gap-[4px] group cursor-pointer hover:text-[#1D9BF0] transition-colors">
      <div className="p-[8px] rounded-full group-hover:bg-[#1D9BF01A] transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z" />
        </svg>
      </div>
      <span className="text-[13px]">1.2K</span>
    </div>

    {/* Bookmark + Share */}
    <div className="flex items-center gap-[2px]">
      <div className="p-[8px] rounded-full cursor-pointer hover:text-[#1D9BF0] hover:bg-[#1D9BF01A] transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z" />
        </svg>
      </div>
      <div className="p-[8px] rounded-full cursor-pointer hover:text-[#1D9BF0] hover:bg-[#1D9BF01A] transition-colors">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z" />
        </svg>
      </div>
    </div>
  </div>
);

const XVerifiedBadge = () => (
  <svg
    viewBox="0 0 22 22"
    aria-label="Verified account"
    role="img"
    className="w-[18px] h-[18px] fill-[#1D9BF0] inline-block ml-[2px]"
  >
    <g>
      <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
    </g>
  </svg>
);

export const XPreview: FC<{ maximumCharacters?: number }> = (props) => {
  const { value: topValue, integration } = useIntegration();
  const current = useLaunchStore((state) => state.current);
  const mediaDir = useMediaDirectory();

  const renderContent = topValue.map((p) => {
    const newContent = stripHtmlValidation(
      'normal',
      p.content.replace(
        /<span.*?data-mention-id="([.\s\S]*?)"[.\s\S]*?>([.\s\S]*?)<\/span>/gi,
        (_match, _match1, match2) => `[[[${match2}]]]`
      ),
      true
    );

    const { start, end } = textSlicer(
      integration?.identifier || '',
      props.maximumCharacters || 280,
      newContent
    );

    const finalValue =
      newContent
        .slice(start, end)
        .replace(
          /\[\[\[([.\s\S]*?)]]]/,
          (_m, m1) => `<span class="font-bold font-[arial]" style="color:#1D9BF0">${m1}</span>`
        ) +
      `<mark class="bg-red-500" data-tooltip-id="tooltip" data-tooltip-content="This text will be cropped">` +
      newContent
        .slice(end)
        .replace(
          /\[\[\[([.\s\S]*?)]]]/,
          (_m, m1) => `<span class="font-bold font-[arial]" style="color:#1D9BF0">${m1}</span>`
        ) +
      `</mark>`;

    return { text: finalValue, images: p.image };
  });

  const displayName = current === 'global' ? 'Global Edit' : (integration?.name || 'Account Name');
  const handle = current === 'global' ? '' : (integration?.display || '@handle');
  const avatar = current === 'global' ? '/no-picture.jpg' : (integration?.picture || '/no-picture.jpg');

  return (
    <div className="w-full p-[16px] font-[system-ui,sans-serif]">
      {renderContent.map((value, index) => (
        <div
          key={`x_post_${index}`}
          className={clsx(
            'flex gap-[12px]',
            index < renderContent.length - 1 && 'mb-[0px]'
          )}
        >
          {/* Avatar + thread line */}
          <div className="flex flex-col items-center">
            <img
              src={avatar}
              alt={displayName}
              className="w-[40px] h-[40px] min-w-[40px] rounded-full object-cover"
            />
            {index < renderContent.length - 1 && (
              <div className="w-[2px] flex-1 bg-[#2F3336] mt-[4px] min-h-[16px]" />
            )}
          </div>

          {/* Post body */}
          <div className="flex-1 min-w-0 pb-[12px]">
            {/* Header */}
            <div className="flex items-center gap-[4px] flex-wrap">
              <span className="font-[700] text-[15px] text-textColor leading-[20px]">
                {displayName}
              </span>
              <XVerifiedBadge />
              <span className="text-[15px] text-[#71767B] leading-[20px] ml-[2px]">
                {handle}
              </span>
              <span className="text-[15px] text-[#71767B]">·</span>
              <span className="text-[15px] text-[#71767B]">now</span>
              {/* More options */}
              <div className="ml-auto text-[#71767B] cursor-pointer hover:text-textColor">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 12c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm9 2c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z" />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div
              className="text-[15px] leading-[20px] text-textColor mt-[4px] whitespace-pre-wrap break-words"
              dangerouslySetInnerHTML={{ __html: value.text }}
            />

            {/* Media grid */}
            {!!value.images?.length && (
              <div
                className={clsx(
                  'mt-[12px] rounded-[16px] overflow-hidden',
                  value.images.length === 1 && 'w-full',
                  value.images.length === 2 && 'grid grid-cols-2 gap-[2px]',
                  value.images.length === 3 && 'grid grid-cols-2 gap-[2px]',
                  value.images.length >= 4 && 'grid grid-cols-2 gap-[2px]'
                )}
              >
                {value.images.slice(0, 4).map((image, imgIdx) => (
                  <a
                    key={`img_${imgIdx}`}
                    href={mediaDir.set(image.path)}
                    target="_blank"
                    rel="noreferrer"
                    className={clsx(
                      'block overflow-hidden',
                      value.images.length === 3 && imgIdx === 0 && 'row-span-2'
                    )}
                    style={{ maxHeight: value.images.length === 1 ? '400px' : '200px' }}
                  >
                    <VideoOrImage
                      autoplay={true}
                      src={mediaDir.set(image.path)}
                    />
                  </a>
                ))}
              </div>
            )}

            {/* Action bar — only on last post in thread */}
            {index === renderContent.length - 1 && (
              <XActions isThread={renderContent.length > 1} />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
