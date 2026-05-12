import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ReportUser } from "@/lib/types";



const toUser = (user: {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  degree: string;
  createdAt: Date;
  updatedAt: Date;
}): ReportUser => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  role: user.role,
  degree: user.degree,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString()
});

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const body = (await request.json()) as Partial<ReportUser>;
  const firstName = body.firstName?.trim() ?? "";
  const lastName = body.lastName?.trim() ?? "";
  const role = body.role?.trim() ?? "";
  const degree = body.degree?.trim() ?? "Lic.";

  if (!firstName || !lastName || !role) {
    return NextResponse.json({ message: "Nombre, apellido y cargo son obligatorios" }, { status: 400 });
  }

  const user = await prisma.reportUser.update({
    where: { id: params.id },
    data: { firstName, lastName, role, degree }
  });

  return NextResponse.json(toUser(user));
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  await prisma.reportUser.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
