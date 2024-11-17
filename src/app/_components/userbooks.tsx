import Link from "next/link";
import React from 'react';

import { api } from "~/trpc/react";

const UserBooks = async () => {

  const books = api.book.getAllForUser.useQuery();

  return (
    <div>
      <h2>Diveable Books</h2>
      <ul>
        {books.data?.map((book) => (
          <li key={book.id}>
              <div>
                <Link href={`/books/${encodeURIComponent(book.id)}`}>{book.name}</Link>
              </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserBooks;
