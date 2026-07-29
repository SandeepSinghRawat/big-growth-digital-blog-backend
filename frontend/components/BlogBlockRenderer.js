export default function BlogBlockRenderer({ blocks = [] }) {
  const renderBlock = (block, key) => {
    console.log("block data", block);
    
    if (!block) {
      return null;
    }

    const renderChildren = (children) => {
      return children.map((child, childIndex) => renderBlock(child, `${key}-${childIndex}`));
    };

    switch (block.type) {
      case 'paragraph':
        if (block.children && block.children.length > 0) {
          return (
            <div key={key} className="space-y-4 text-slate-700 leading-8">
              {block.text ? <p>{block.text}</p> : null}
              {renderChildren(block.children)}
            </div>
          );
        }
        return (
          <p key={key} className="text-slate-700 leading-8">
            {block.text}
          </p>
        );
      case 'text':
        return (
          <span key={key} className="text-slate-700">
            {block.text}
          </span>
        );
      case 'link':
        return (
          <a key={key} href={block.href} target="_blank" rel="noreferrer" className="text-sky-600 hover:text-sky-700">
            {block.text}
          </a>
        );
      case 'heading': {
        const HeadingTag = `h${block.level || 3}`;
        return (
          <HeadingTag key={key} className="text-2xl font-semibold text-slate-950 mt-8 mb-4">
            {block.text}
          </HeadingTag>
        );
      }
      case 'section': {
        const SectionHeading = block.heading ? `h${block.headingLevel || 2}` : 'div';
        const HeadingTag = block.heading ? SectionHeading : 'div';
        return (
          <section key={key} className="space-y-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
            {block.heading ? (
              <HeadingTag className="text-3xl font-semibold text-slate-950">
                {block.heading}
              </HeadingTag>
            ) : null}
            {block.children && block.children.length > 0 ? renderChildren(block.children) : null}
          </section>
        );
      }
      case 'quote':
        return (
          <blockquote key={key} className="rounded-3xl border-l-4 border-slate-300 bg-slate-50 p-6 italic text-slate-700">
            {block.text}
          </blockquote>
        );
      case 'image':
        return (
          <img
            key={key}
            src={block.src}
            alt={block.alt || ''}
            className="content-image shadow-sm"
          />
        );
      case 'video':
        return (
          <div key={key} className="video-wrapper rounded-3xl overflow-hidden shadow-sm">
            <iframe src={block.src} title={block.caption || 'Video'} frameBorder="0" allowFullScreen />
          </div>
        );
      case 'list': {
        const renderListItems = (items, isOrdered) => {
          const ListTag = isOrdered ? 'ol' : 'ul';
          const listClass = isOrdered ? 'list-decimal' : 'list-disc';
          return (
            <ListTag className={`${listClass} space-y-2 pl-8 text-slate-700`}>
              {(items || []).map((item, itemIndex) => {
                const itemText = typeof item === 'string' ? item : item.text;
                const children = typeof item === 'string' ? [] : item.children;
                const childStyle = typeof item === 'string' ? block.style : item.style || block.style;
                return (
                  <li key={itemIndex}>
                    {itemText}
                    {children && children.length > 0 ? renderListItems(children, childStyle === 'ordered') : null}
                  </li>
                );
              })}
            </ListTag>
          );
        };
        return (
          <div key={key}>
            {renderListItems(block.items || [], block.style === 'ordered')}
          </div>
        );
      }
      case 'table':
        return (
          <div key={key} className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
            <table className="content-table w-full">
              <thead>
                <tr>
                  {(block.headers || []).map((header, headerIndex) => (
                    <th key={headerIndex} className="bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(block.rows || []).map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="border-t border-slate-200 px-4 py-3 text-sm text-slate-700">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'faq':
        return (
          <section key={key} className="faq-block">
            <h2 className="text-2xl p-5">FAQ</h2>
            {(block.items || []).map((item, itemIndex) => (
              <div key={itemIndex} className="space-y-2 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <strong className="block text-slate-900">{item.question}</strong>
                <p className="text-slate-700">{item.answer}</p>
              </div>
            ))}
          </section>
        );
      case 'cta':
        return (
          <aside key={key} className="cta-block rounded-3xl shadow-sm">
            <h3 className="text-xl font-semibold">{block.heading}</h3>
            <p className="mt-3 text-slate-100">{block.text}</p>
            {block.url ? (
              <a href={block.url} className="mt-4 inline-flex rounded-full bg-sky-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600">
                {block.buttonText || 'Learn more'}
              </a>
            ) : null}
          </aside>
        );
      case 'html':
        return (
          <div key={key} className="text-slate-700 leading-8" dangerouslySetInnerHTML={{ __html: block.html || '' }} />
        );
      default:
        return null;
    }
  };

  return <div className="space-y-8">{blocks.map((block, index) => renderBlock(block, index))}</div>;
}
