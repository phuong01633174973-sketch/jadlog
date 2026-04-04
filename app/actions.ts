"use server"

export async function getWhatsAppCode(formData: FormData) {
  const phone = formData.get("phone")

  try {
    // aqui você vai integrar com sua API depois
    // por enquanto retorna um código fake

    const fakeCode = "123-456"

    return {
      success: true,
      code: fakeCode,
    }
  } catch (error) {
    return {
      success: false,
      error: "Erro ao gerar código",
    }
  }
}

export async function checkInstanceStatus() {
  try {
    // depois você conecta com sua API real

    return {
      success: true,
      connected: false,
    }
  } catch (error) {
    return {
      success: false,
      connected: false,
    }
  }
}
